const RoomManager = require('../../lib/roomManager').RoomManager;
const User = require('../../lib/userService').User;
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

/**
 * Manage the message of SDP and ICE from client
 * @param {object} ws WebSocket connection.
 * @param {object} args
 */
service.onDirectMessage = async (ws,args) => {
  const room_id = args.room;
  const msg = args.msg.split('|');
  const msg_type = msg[0];
  // Split the message into msg_type, msg_data
  // onSDP
  if(msg_type == 'sdp') {
    // Send sdp to Kurento Client
    to_send = {
      type: msg[1],
      sdp: msg[2]
    }
    console.log( to_send );
  }
  // onICE
  if(msg_type == 'ice') {
    // Send ice to Kurento Client
    to_send = {
      candidate: msg[1].replace("candidate",""),
      sdpMLineIndex: msg[2],
      sdpMid: msg[3]
    }
    console.log( to_send );
  }

  await updateDirectMessage(room_id, ws.id , msg_type , to_send);
}
