const kurento = require('kurento-client');
const config = require('../lib/config');
const User = require('./userService');
const MediaServerManager = require('./mediaServerManager').MediaServerManager;
/**
 * The RoomManager class defines the `getSingleton` method that lets clients access
 * the unique singleton instance.
 */
class RoomManager {
    
    constructor() {
        console.log(config.kmsuri);
        this._status = "IDLE";
        this._mediaServerMgr = MediaServerManager.getSingleton();
        this._mediaServerBasic = undefined;
        this._rooms = {};
        this._instance;
        // this.createRoom('HELLOW');
    }

    static getSingleton() {
        if (!this._instance) {
            this._instance = new RoomManager();
        }
        return this._instance;
    }

    async initialize() {
        // Add Media server based on config.kmsuri
        if (await this._mediaServerMgr.addMediaServer(config.kmsuri)){
            this._mediaServerBasic = await this._mediaServerMgr.getMediaServer(config.kmsuri);
        }
        return this._mediaServerBasic.status;
    }

    async createRoom(roomId="HELLOW",mediaServer=this._mediaServerBasic) {
        // Check if room already exists
        if (this._rooms[roomId]) {
            return false;
        }
        // create pipeline for room
        mediaServer.kurento_client.create('MediaPipeline', (error, pipeline) => {
            if (error) {
                console.log(error);
            }
            let room = {
                name: (roomId=="HELLOW")? roomId : this.generateRoomId(),
                metadata: {design:'default'},
                pipeline: pipeline,
                users: {}
            };
            this._rooms[roomId] = room;
        });
        return true;
    }

    addUserToRoom(roomName, userId, user) {
        this._rooms[roomName].users[userId] = user;
    }

    removeUserFromRoom(roomName, userId) {
        delete this._rooms[roomName].users[userId];
    }
    getUsersOfRoom(roomName) {
        return this._rooms[roomName].users || null;
    }

    getRoom(roomName) {
        return this._rooms[roomName] || null;
    }

    getAllRooms() {
        return this._rooms;
    }

    getStatus() {
        return this._status;
    }

    // Generate 6 long unique Room ID
    generateRoomId() {
        return Math.random().toString(36).substr(2, 6);        
    }

    getInfo(roomName) {
        if(roomName){
            return {
                name: this._rooms[roomName].name,
                pipeline: JSON.stringify(this._rooms[roomName].pipeline),
                users: this._rooms[roomName].users
            }
        }
    }

    async updateDirectMessage(room_id, user_id, msg_type , msg_data) {
        let user = this.getUsersOfRoom(room_id)[user_id];
        if (user) {
            if(msg_type == 'ice'){
                user.endpoint.addIceCandidate(kurento.getComplexType('IceCandidate')(msg_data));
            }
            else if(msg_type == 'sdp'){
                try {
                    sdp_answer = await user.endpoint.processOffer(msg_data);                    
                } catch (error) {
                    console.log("Error in processOffer:",error);
                }
            }
            else{
                console.log("Error in updateDirectMessage:",error);
            }
        }
    }

}


class RoomDesign {
    constructor() {
        this.id = undefined,
        this.mediaPipeline = undefined,
        this.design = undefined;
    }
}

module.exports = {
    RoomManager:RoomManager
}