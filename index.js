// Require the framework and instantiate it
const fastify = require('fastify')();

fastify.register(require('./routes/status'));
fastify.register(require('./routes/satcom'));
fastify.register(require('./routes/sensors'));

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3939);
        fastify.log.info(`server listening on ${fastify.server.address().port}`);
    } catch (err) {
        fastify.log.error(err);
        throw err;
    }
};

start();
