const AppSingleton = require('../appsingleton');

const sharedInstance = AppSingleton.getInstance();

async function routes (fastify, options) {
    fastify.get('/status', async (request, reply) => {
        return sharedInstance;
    });
}

module.exports = routes;
