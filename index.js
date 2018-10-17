// Require the framework and instantiate it
const fastify = require('fastify')();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const AppSingleton = require('./appsingleton');
const init = require('./init');

const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({
    messages: [],
    unread: []
}).write();

const sharedInstance = AppSingleton.getInstance();

sharedInstance.db = db;

sharedInstance.satcom = {
    status: 'UNKNOWN'
};

sharedInstance.gps = {
    coord: 'NOT FIXED'
};

sharedInstance.sensors = {
    co2: 'N/A',
    temp: 'N/A',
    pressure: 'N/A'
};

fastify.register(require('./routes/status'));
fastify.register(require('./routes/satcom'));
fastify.register(require('./routes/sensors'));

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3939);
        init();
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        throw err;
    }
};

start();
