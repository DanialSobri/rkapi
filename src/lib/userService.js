class User {
    constructor(ws, roomManager,roomName) {
        this.ws = ws;
        this.id = ws.id;
        this.roomManager = roomManager;
        this.currentRoom = null;
        this.endpoint = null;
        this.candidatesQueue= [];
        this.roomName = roomName;
    }
    async initialized(roomName=this.roomName) {
        try{
            
            this.currentRoom = this.roomManager.getRoom(roomName);
            if (!this.currentRoom) {
                throw new Error("Room does not exist");
            }

            // create an WebRtcEndpoint on the room media pipeline
            this.endpoint = await this.currentRoom.pipeline.create('WebRtcEndpoint');
            // Add ice candidates from all users, that already in the room
            const roomUsers = Object.values(this.roomManager.getUsersOfRoom(roomName));
            if (roomUsers.length > 0) {
                roomUsers.forEach(() => {
                    var message = roomUsers.shift();
                    if(message.candidate)
                        this.endpoint.addIceCandidate(message.candidate);
                })
            }

            this.endpoint.on('OnIceCandidate', ({ candidate }) => {
                // TODO: send ice candidate to all users in the room
                let _candidate = kurento.getComplexType('IceCandidate')(candidate);
                console.error('user : ' + this.id + ' sending candidate for outgoing media');
                sendSocketMessageToUsers({
                    id: 'iceCandidate',
                    sessionId: pid,
                    candidate: _candidate
                });
                this.candidatesQueue.push(candidate);
            });

            this.roomManager.addUserToRoom(roomName, this.id, this);            
            return true;
        }
        catch(error){
            console.error('Error creating endpoint', error);
            this.currentRoom.pipeline.release();
            return false;
        }
    }

    async joinRoom(roomName=this.roomName) {
        try{
            this.currentRoom = this.roomManager.getRoom(roomName);
            if (!this.currentRoom) {
                throw new Error("Room does not exist");
            }
            // Connect Endpoint based on strategy
            const roomUsers = Object.values(this.roomManager.getUsersOfRoom(roomName));
            if (roomUsers.length > 1) {
                roomUsers.forEach(() => {
                    var element = roomUsers.shift();
                    this.endpoint.connect(element.endpoint,'VIDEO');
                    element.endpoint.connect(this.endpoint,'VIDEO');
                })
            }               
            return true;
        }
        catch(error){
            console.error('Error joinRoom', error);
            this.currentRoom.pipeline.release();
            return false;
        }
    }

    leaveRoom(roomName=this.roomName) {
        try{
            this.currentRoom = this.roomManager.getRoom(roomName);
            if (!this.currentRoom) {
                throw new Error("Room does not exist");
            }
            // Disconnect Endpoint based on strategy
            const roomUsers = Object.values(this.roomManager.getUsersOfRoom(roomName));
            if (roomUsers.length > 1) {
                roomUsers.forEach(() => {
                    var element = roomUsers.shift();
                    this.endpoint.disconnect(element.endpoint,'VIDEO');
                    element.endpoint.disconnect(this.endpoint,'VIDEO');
                })
            }
            // Release endpoint
            this.endpoint.release();
            this.endpoint = null;
            // Clear candidates queue
            this.candidatesQueue = [];
            // Remove user from room
            this.roomManager.removeUserFromRoom(roomName, this.id);
            this.roomName = null;
            this.currentRoom = null;
            return true;
        }
        catch(error){
            console.error('Error leaveRoom', error);
            return false;
        }
    }

    getInfo(){
        return {
            ws : this.ws,
            id : this.id,
            roomMgr : this.roomManager.getStatus(),
            // currentRoom : this.roomManager.getInfo(this.currentRoom.name),
            endpoint : JSON.stringify(this.endpoint)
        }
    }

    receiveVideoFrom({senderId, sdpOffer}) {
        const sender = this.roomManager.getParticipantById(senderId);
        const room = this.roomManager.getRoom(this.roomName);

        (this.getSubscriber(senderId) || this.newSubscriberEndpoint(sender, room.pipeline))
            .then(endpoint => this.connectToRemoteParticipant(endpoint, sender, sdpOffer));
    }

    // TODO: release socket + delete user from room
    socketError() {
        console.log("Error connecting user to room" + this.roomName)
    }

    sendSocketMessageToUsers(data) {
        this.ws.send(JSON.stringify(data));
        console.log("Sending message to user: " + this.id + " data: " + JSON.stringify(data));
    }

}

module.exports = {
    User:User
}