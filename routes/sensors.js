async function routes (fastify, options) {
    fastify.get('/sensors', async (request, reply) => {
        return { hello: 'world' };
    });
}

module.exports = routes;
