const kurento = require('kurento-client');
const config = require('../lib/config');

/**
 * The MediaServerManager class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
class MediaServerManager {

    constructor() {
        this._mediaServers = {};
        this._instance;
    }

    static getSingleton() {
        if (!this._instance) {
            this._instance = new MediaServerManager();
        }
        return this._instance;
    }
    
    async addMediaServer(ms_url,debug=false) {
        if(this._mediaServers[ms_url]) {
            return false;
        }
        let mediaServer = {
            kurento_client:undefined,
            status:"IDLE"
        }
        // TODO: set time out if the server unreachable
        // Debug=true for unit testing purposes
        if(!debug) {
            try {
                let options = {access_token:config.kurento_token}
                mediaServer.kurento_client =  await kurento.getSingleton(ms_url,options);
                // console.log("Media server connected: " + ms_url)
                if(mediaServer.kurento_client) {
                    mediaServer.status = "READY";
                    // console.log("Media server status: " + mediaServer.status)
                }  
            } catch (error) {
                mediaServer.status = "ERROR";
            }        
        }

        this._mediaServers[ms_url] = mediaServer;
        return true;
    }

    async rmMediaServer(ms_url) {
        if(this._mediaServers[ms_url]) {
            delete this._mediaServers[ms_url];
            return true;
        }
        return false;
    }

    async getMediaServer(ms_url) {
        return this._mediaServers[ms_url] || undefined;
    }

    async getMediaServers() {
        return this._mediaServers;
    }

    async updateMediaServer(ms_url, kurentoClient, status) {
        let ms = await this.getMediaServer(ms_url);
        if(!ms) {
            return false;
        }
        let res = false;

        if (kurentoClient) {
            ms.kurento_client = kurentoClient;
            res = true;
        }
        if (status) {
            ms.status = status;
            res = true;
        }
        return res;
    }
}

module.exports = {
    MediaServerManager:MediaServerManager
}