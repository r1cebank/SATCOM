async function routes (fastify, options) {
    fastify.get('/status', async (request, reply) => {
        return { hello: 'world' };
    });
}

module.exports = routes;
