const WebSocket = require('ws');
const service = module.exports = {};

let m_rooms = [];

/**
 * 
 * @param {object} ws WebSocket connection.
 */
service.onEcho = async (ws,{ message }) => {
  console.log(`Message from the client: ${message}`);
  ws.wsid = message;
  m_rooms.push(ws);
  ws.send('Message from the server: Implement here your business logic that sends messages to a client after it connects.');
};
/**
 * 
 * @param {object} ws WebSocket connection.
 * @param {object} options
 * @param {string} options.path The path in which the message was received.
 * @param {object} options.query The query parameters used when connecting to the server.
 * @param {string} options.message The received message.
 */
service.sendEcho = async (ws, { message, path, query }) => {
  // Broadcast messages to all participants in a room.
  m_rooms.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (client.wsid !== ws.wsid) {
        client.send(message);
      }
    }});
  ws.send('Message from the server: Implement here your business logic that reacts on messages sent from a client.');
};
