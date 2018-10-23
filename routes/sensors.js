const AppSingleton = require('../appsingleton');

const sharedInstance = AppSingleton.getInstance();

async function routes (fastify, options) {
    fastify.get('/sensors', async (request, reply) => {
        return sharedInstance.sensors;
    });
}

module.exports = routes;
