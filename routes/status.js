const AppSingleton = require('../appsingleton');

const sharedInstance = AppSingleton.getInstance();

async function routes (fastify, options) {
    fastify.get('/status', async (request, reply) => {
        return {
            satcom: sharedInstance.satcom,
            gps: sharedInstance.gps,
            sensors: sharedInstance.sensors,
            sessions: sharedInstance.sessions
        };
    });
}

module.exports = routes;
