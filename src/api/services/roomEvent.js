const service = module.exports = {};

/**
 * 
 * @param {object} ws WebSocket connection.
 */
service.onRoomEvent = async (ws) => {
  ws.send('Message from the server: Implement here your business logic that sends messages to a client after it connects.');
};

service.sendRoomEvent = async (ws, {room_event,room_id}) => {
  ws.send(JSON.stringify({
    event: 'RoomEvent',
    data:{
      room_event: room_event,
      room: room_id,
    },
  }))
}
