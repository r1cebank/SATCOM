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

        if (sharedInstance.gps.lat === -1) {
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

        const id = await sharedInstance.sendMessage(message);

        sharedInstance.sessions[sessionId].hello = true;
        db.get('sessions')
        .find({
            id: sessionId
        })
        .assign({ hello: true, lastMessage: message })
        .write();
        return { id, message };
    });
    fastify.post('/session/sendLocation', async (request, reply) => {
        const sessionId = request.body.sessionId;
        if (!sharedInstance.sessions[sessionId]) {
            throw new Error('Session id not found');
        }

        if (sharedInstance.gps.lat === -1) {
            throw new Error('GPS not ready.');
        }
        if (sharedInstance.satcom.status === 'ACQUIRING') {
            throw new Error('SATCOM not ready.');
        }

        const message = {
            sessionId,
            gps: sharedInstance.gps
        };

        const id = await sharedInstance.sendMessage(JSON.stringify(message));

        db.get('sessions')
        .find({
            id: sessionId
        })
        .assign({ hello: true, lastMessage: message })
        .write();
        return { id, message };
    });
}

module.exports = routes;
