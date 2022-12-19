const RoomManager = require('../roomManager').RoomManager;
const User = require('../userService').User;
const expect = require('chai').expect;

kurentoClient_ignore = true;
describe("Unit Test for UserService", function() {
    // Global variable
    const roomMgr = RoomManager.getSingleton();
    let user_a = undefined;
    let user_b = undefined;
    let fakeSocket = {
        id: "fakeSocketId",
        emit: function() {}
    };
    let fakeSocket2 = {
        id: "fakeSocketId2",
        emit: function() {}
    };
    
    it('1. Test createRoom function', async function() {
        expect(await roomMgr.initialize()).to.equal("READY");
        await roomMgr.createRoom("AAAAAA")
        expect(roomMgr.getRoom("AAAAAA")).to.not.equal(null);
        expect(roomMgr.getRoom("AAAAAB")).to.equal(null);
    });

    it('2. Test initialized function', async function() {
        user_a = new User(fakeSocket,roomMgr,"AAAAAA");
        user_b = new User(fakeSocket2,roomMgr,"AAAAAA");
        expect(await user_a.initialized()).to.equal(true);
        expect(await user_b.initialized()).to.equal(true);
    });
    
    it('3. Test joinRoom function', async function() {
        expect(roomMgr.getRoom("AAAAAA")).to.not.equal(null);
        expect(await user_a.joinRoom()).to.equal(true);
    });

    it('4. Test leaveRoom function', async function() {
        expect(roomMgr.getRoom("AAAAAA")).to.not.equal(null);
        user_a.leaveRoom();
        console.log("Debug after leaveRoom:",roomMgr.getRoom("AAAAAA"));
        // user_a = new User(fakeSocket,roomMgr,"AAAAAA");
        expect(await user_a.initialized("AAAAAA")).to.equal(true);
        expect(await user_a.joinRoom("AAAAAA")).to.equal(true);
        console.log("Debug after reenter:",roomMgr.getRoom("AAAAAA"));
    });
});