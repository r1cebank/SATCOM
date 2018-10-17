const iridium = require('iridium-sbd');
const fastify = require('fastify')();

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
    // Init I2C connection
}

module.exports = init;
