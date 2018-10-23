const iridium = require('iridium-sbd');
const fastify = require('fastify')();
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
            sharedInstance.iridium.sendMessage(message, (error, momsn) => {
                if (error) { reject(error); }
                resolve(momsn);
            });
        });
    };

    sharedInstance.satcom.status = 'ACQUIRING';
    iridium.on('initialized', () => {
        fastify.log.info('Iridium initialized');
        sharedInstance.satcom.status = 'CONNECTED';
    });
    iridium.on('debug', (log) => {
        fastify.log.info(`>>> ${log}`);
    });
    iridium.on('newmessage', (message, queued) => {
        fastify.log.info(`Received new message ${message}`);
        iridium.getSystemTime((err, time) => {
            const sateliteMessage = {
                message,
                timestamp: time
            };
            db.get('messages').push(sateliteMessage).write();
            db.get('unread').push(sateliteMessage).write();
        });
    });
    // Init Serial connection
    sharedInstance.sensorPort = new SerialPort('/dev/ttyUSB0', {
        baudRate: 115200
    });
    const parser = sharedInstance.sensorPort.pipe(new Readline({ delimiter: '\r\n' }));
    parser.on('data', (data) => {
        try {
            JSON.parse(data);
            sharedInstance.gps.time = data.data.gps.time;
            sharedInstance.gps.lat = data.data.gps.lat;
            sharedInstance.gps.lng = data.data.gps.lng;
            sharedInstance.sensors = data.data.sensors;
        } catch (error) {
            fastify.log.error(error);
        }
    });
}

module.exports = init;
