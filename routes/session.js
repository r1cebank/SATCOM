const shortid = require('shortid');

const AppSingleton = require('../appsingleton');

const sharedInstance = AppSingleton.getInstance();

const db = sharedInstance.db;

async function routes (fastify, options) {
    fastify.post('/session/create', async (request, reply) => {
        const sessionId = shortid.generate();
        sharedInstance.sessions[sessionId] = {
            id: sessionId
        };
        db.get('sessions').push({
            id: sessionId
        }).write();
        return sessionId;
    });
    fastify.post('/session/hello', async (request, reply) => {
        const sessionId = request.body.sessionId;
        if (!sharedInstance.sessions[sessionId]) {
            throw new Error('Session id not found');
        }

        if (sharedInstance.gps.time === 'UNKNOWN') {
            throw new Error('GPS not ready.');
        }
        if (sharedInstance.satcom.status === 'ACQUIRING') {
            throw new Error('SATCOM not ready.');
        }
        if (Object.keys(sharedInstance.sensors)
            .filter((k) => sharedInstance.sensors[k] === -1).length) {
            throw new Error('Sensors not ready');
        }

        const message = {
            sessionId,
            gps: sharedInstance.gps,
            sensors: sharedInstance.sensors
        };

        await sharedInstance.sendMessage(message);

        sharedInstance.sessions[sessionId].hello = true;
        db.get('sessions')
        .find({
            id: sessionId
        })
        .assign({ hello: true, lastMessage: message })
        .write();
        return message;
    });
    fastify.post('/session/sendLocation', async (request, reply) => {
        const sessionId = request.body.sessionId;
        if (!sharedInstance.sessions[sessionId]) {
            throw new Error('Session id not found');
        }

        if (sharedInstance.gps.time === 'UNKNOWN') {
            throw new Error('GPS not ready.');
        }
        if (sharedInstance.satcom.status === 'ACQUIRING') {
            throw new Error('SATCOM not ready.');
        }

        const message = {
            sessionId,
            gps: sharedInstance.gps
        };

        await sharedInstance.sendMessage(message);

        db.get('sessions')
        .find({
            id: sessionId
        })
        .assign({ hello: true, lastMessage: message })
        .write();
        return message;
    });
}

module.exports = routes;
