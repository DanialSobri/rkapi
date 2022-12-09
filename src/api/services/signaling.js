const service = module.exports = {};

/**
 * 
 * @param {object} ws WebSocket connection.
 * @param {object} options
 * @param {string} options.path The path in which the message was received.
 * @param {object} options.query The query parameters used when connecting to the server.
 * @param {string} options.message The received message.
 */
service.recvHeartbeat = async (ws) => {
  // console.log(`getHeartbeat`);
};

/**
 * 
 * @param {object} ws WebSocket connection.
 * @param {object} message
 */
service.onSDP = async (ws,{ message }) => {
  console.log(`Message from the client: ${message}`);
  ws.wsid = message;
  m_rooms.push(ws);
  ws.send('Message from the server: Implement here your business logic that sends messages to a client after it connects.');
};