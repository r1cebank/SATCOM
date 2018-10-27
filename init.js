const iridium = require('iridium-sbd');
const fastify = require('fastify')({
    logger: true
});
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const AppSingleton = require('./appsingleton');

const sharedInstance = AppSingleton.getInstance();

const db = sharedInstance.db;

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
            iridium.getSystemTime((err, time) => {
                const sateliteMessage = {
                    direction: 'OUTGOING',
                    message,
                    timestamp: time
                };
                sharedInstance.db.get('messages').push(sateliteMessage).write();
                sharedInstance.iridium.sendMessage(message, (error, momsn) => {
                    if (error) { reject(error); }
                    resolve(momsn);
                });
            });
        });
    };

    sharedInstance.satcom.status = 'ACQUIRING';
    iridium.on('initialized', () => {
        fastify.log.info('Iridium initialized');
        setInterval(() => {
            iridium.getSystemTime((err, time) => {
                sharedInstance.satcom.time = time.toLocaleString();
            });
        }, 10000);
        sharedInstance.satcom.status = 'CONNECTED';
    });
    iridium.on('debug', (log) => {
        fastify.log.info(`>>> ${log}`);
    });
    iridium.on('newmessage', (message, queued) => {
        fastify.log.info(`Received new message ${message}`);
        iridium.getSystemTime((err, time) => {
            const sateliteMessage = {
                direction: 'INCOMING',
                message,
                timestamp: time
            };
            db.get('messages').push(sateliteMessage).write();
            db.get('unread').push(sateliteMessage).write();
            sharedInstance.unread.push(sateliteMessage);
        });
    });
    // Init Serial connection
    sharedInstance.sensorPort = new SerialPort('/dev/ttyUSB0', {
        baudRate: 115200
    });
    const parser = sharedInstance.sensorPort.pipe(new Readline({ delimiter: '\r\n' }));
    parser.on('data', (data) => {
        try {
            const parsedData = JSON.parse(data);
            sharedInstance.gps.time = parsedData.data.gps.time;
            sharedInstance.gps.lat = parsedData.data.gps.lat;
            sharedInstance.gps.lng = parsedData.data.gps.lng;
            sharedInstance.sensors = parsedData.data.sensors;
        } catch (error) {
            fastify.log.error(error);
        }
    });
}

module.exports = init;
