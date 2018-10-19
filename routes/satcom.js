const AppSingleton = require('../appsingleton');

const sharedInstance = AppSingleton.getInstance();

async function routes (fastify, options) {
    // Get all messages
    fastify.get('/satcom/messages', async (request, reply) => {
        return sharedInstance.db.get('messages').value();
    });
    // Get new messages in mailbox
    fastify.get('/satcom/fetch', async (request, reply) => {
        return sharedInstance.db.get('unread').value();
    });
    fastify.post('/satcom/messages', async (request, reply) => {
        const momsn = await sharedInstance.sendMessage(request.body.message);
        return { momsn };
    });
}

module.exports = routes;
