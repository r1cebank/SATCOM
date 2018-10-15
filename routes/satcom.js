async function routes (fastify, options) {
    fastify.get('/satcom/messages', async (request, reply) => {
        return { hello: 'world' };
    });
    fastify.post('/satcom/messages', async (request, reply) => {
        return { hello: 'world' };
    });
}

module.exports = routes;
