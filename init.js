const iridium = require('./iridium');
const fastify = require('fastify')({
    logger: true
});
const SerialPort = require('serialport');
const interval = require('interval-promise');
const Readline = require('@serialport/parser-readline');

const AppSingleton = require('./appsingleton');

const sharedInstance = AppSingleton.getInstance();

function init () {
    // Init satelite communication
    iridium.open({
        debug: 1,
        port: '/dev/ttyAMA0',
        flowControl: true
    });
    sharedInstance.iridium = iridium;

    sharedInstance.sendMessage =  async (message) => {
        return new Promise((resolve, reject) => {
            const sateliteMessage = {
                direction: 'OUTGOING',
                message,
                timestamp: sharedInstance.satcom.time
            };
            sharedInstance.db.get('messages').push(sateliteMessage).write();
            sharedInstance.iridium.sendMessage(message, (error, momsn) => {
                if (error) { reject(error); }
                resolve(momsn);
            });
        });
    };

    sharedInstance.satcom.status = 'ACQUIRING';
    iridium.on('initialized', () => {
        fastify.log.info('Iridium initialized');
        // setInterval(() => {
        //     iridium.getSystemTime((err, time) => {
        //         sharedInstance.satcom.time = time.toLocaleString();
        //     });
        // }, 10000);
        sharedInstance.satcom.status = 'INITIALIZED';
        iridium.waitForNetwork(async () => {
            sharedInstance.satcom.status = 'NETWORK READY';
            interval(async (i, stop) => {
                try {
                    await sharedInstance.sendMessage('ping');
                    sharedInstance.satcom.status = 'READY FOR MESSAGE';
                    stop();
                } catch (e) {
                    sharedInstance.satcom.status = 'PING FAILED';
                }
            }, 10000);
        });
    });
    iridium.on('debug', (log) => {
        fastify.log.info(`>>> ${log}`);
    });
    iridium.on('ringalert', () => {
        iridium.mailboxCheck();
    });
    iridium.on('newmessage', (message, queued) => {
        fastify.log.info(`Received new message ${message}`);
        const sateliteMessage = {
            direction: 'INCOMING',
            message.toString(),
            timestamp: sharedInstance.satcom.time
        };
        sharedInstance.db.get('messages').push(sateliteMessage).write();
        sharedInstance.db.get('unread').push(sateliteMessage).write();
        sharedInstance.unread.push(sateliteMessage);
    });
    // Init Serial connection
    sharedInstance.sensorPort = new SerialPort('/dev/ttyUSB0', {
        baudrate: 115200
    });
    const parser = sharedInstance.sensorPort.pipe(new Readline({ delimiter: '\r\n' }));
    parser.on('data', (data) => {
        try {
            const dataFrames = data.split(' ');
            const gpsData = dataFrames[0].split(',');
            const sensorData = dataFrames[1].split(',');
            sharedInstance.gps = {
                status: gpsData[0],
                lat: gpsData[1],
                lng: gpsData[2],
                time: gpsData[3]
            };
            sharedInstance.sensors = {
                temperature: sensorData[0],
                pressure: sensorData[1],
                humidity: sensorData[2],
                gasResistance: sensorData[3],
                altitude: sensorData[4]
            };
        } catch (error) {
            fastify.log.error(error);
        }
    });
}

module.exports = init;
