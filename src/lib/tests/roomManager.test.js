const RoomManager = require('../roomManager').RoomManager;
const expect = require('chai').expect;

kurentoClient_ignore = true;
describe("Unit Test for RoomManager", function() {
    // Global variable
    const roomMgr = RoomManager.getSingleton();

    it('1. Test getSingleton function', async function(done) {
        let roomMgr2 = RoomManager.getSingleton();
        expect(roomMgr).to.equal(roomMgr2);
        done();
        });
    it('2. Test createRoom function', async function() {
        expect(await roomMgr.initialize()).to.equal("READY");
        await roomMgr.createRoom("AAAAAA")
        expect(roomMgr.getRoom("AAAAAA")).to.not.equal(undefined);
        expect(roomMgr.getRoom("AAAAAB")).to.equal(null);
        });
});