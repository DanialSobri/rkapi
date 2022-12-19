const MediaServerManager = require("../mediaServerManager").MediaServerManager
const expect = require('chai').expect;

// Test are run by ignore the kurentoClient status
kurentClient_ignore = true;
describe("Unit Test for MediaServerManager", function() {
    // Global variable
    const msMgr = MediaServerManager.getSingleton();

    it('1. Test getSingleton function', async function() {
        let msMgr2 = MediaServerManager.getSingleton();
        expect(msMgr).to.equal(msMgr2);
        });

    it('2. Test addMediaServer function', async function() {
        // Add 2 different media servers
        expect(await msMgr.addMediaServer("ws://test1",kurentClient_ignore)).to.equal(true);
        expect(await msMgr.addMediaServer("ws://test2",kurentClient_ignore)).to.equal(true);
        expect(Object.values(await msMgr.getMediaServers()).length).to.equal(2);
        // Add the same media server
        expect(await msMgr.addMediaServer("ws://test2",kurentClient_ignore)).to.equal(false);
        expect(Object.values(await msMgr.getMediaServers()).length).to.equal(2);
    });

    it('3. Test rmMediaServer function', async function() {
        // Remove avilable media server
        expect(await msMgr.rmMediaServer("ws://test1")).to.equal(true);
        expect(Object.values(await msMgr.getMediaServers()).length).to.equal(1);
        // Remove unavilable media server
        expect(await msMgr.rmMediaServer("ws://test1")).to.equal(false);
        expect(Object.values(await msMgr.getMediaServers()).length).to.equal(1);
        });

    it('4. Test getMediaServer function', async function() {
        // Get available media server
        expect((await msMgr.getMediaServer("ws://test2"))).to.not.equal(undefined);    
        // Get unavailable media server
        expect((await msMgr.getMediaServer("ws://test1"))).to.equal(undefined);
        // Get media server kurento client
        expect((await msMgr.getMediaServer("ws://test2")).status).to.equal("IDLE");  
        });

    it('5. Test getMediaServers function', async function() {
        expect(Object.values(await msMgr.getMediaServers()).length).to.equal(1);
        });
    
    it('6. Test updateMediaServer function', async function() {
        // Check status before update
        expect((await msMgr.getMediaServer("ws://test2")).status).to.equal("IDLE");  
        // Update status on available media server
        expect((await msMgr.updateMediaServer("ws://test2",undefined,"TEST"))).to.equal(true);  
        expect((await msMgr.getMediaServer("ws://test2")).status).to.equal("TEST");  
        // Update status on unavailable media server
        expect((await msMgr.updateMediaServer("ws://test1",undefined,"TEST"))).to.equal(false);  
        expect((await msMgr.getMediaServer("ws://test2")).status).to.equal("TEST");
        // Remove media server
        expect(await msMgr.rmMediaServer("ws://test2")).to.equal(true);    
    });
})
