const util = require('util');
const { Router } = require('express');
const { pathParser } = require('../lib/path');
const { yellow } = require('../lib/colors');
const { onEcho, sendEcho } = require('./services/echo');
const signaling = require('./services/signaling');
const roomEvent = require('./services/roomEvent');

const router = Router();
module.exports = router;

router.ws('/echo', async (ws, req) => {
  websocketId = req.headers['sec-websocket-key']
  const path = pathParser(req.path);
  console.log(`${yellow(path)} client connected.`);
  await onEcho(ws,{ message: websocketId });
  ws.on('message', async (msg) => {
    console.log(`${yellow(path)} message was received:`);
    console.log(util.inspect(msg, { depth: null, colors: true }));
    await sendEcho(ws, { message: msg, path, query: req.query });
  });
});

router.ws('/roomEvent/{roomId}', async (ws, req) => {
  const path = pathParser(req.path);
  console.log(`${yellow(path)} client connected.`);
  await onRoomEvent(ws);
});

router.get('/status', (req, res) => {
  res.send("<h1>Server Condition!</h1>\
    Number Clients :\
    <p>Connect to RKurento MS at \"wss://35.190.197.200:8433/kurento\"⚡</p> \
  ");
});

router.get('/', (req, res) => {
  res.render('hello', {title: 'express'});
  // res.sendFile(path.join(__dirname, "../../index.html")); 
});

router.get('/admin', (req, res) => {
  res.render('admin', {title: 'express'});
  // res.sendFile(path.join(__dirname, "../../index.html")); 
});

// POST /registration/create
// Payload:
// {
//     "app": "string",
//     "device": "string",
//     "authentication": {
//         "method": "int",
//         "payload": "string"
//     }
// }
// Response:
// {
//     "confirmation_code": "string",
//     "registration_token": "string",
//     "confirmation_timeout": "string"
// }
router.get('/registration/create', (req, res) => {
  res.send("<h1>Register Hololens</h1>");
});

// GET /registration/check
// Payload:
// {
//      "registration_token": "string",
// }
// Response:
// {
//     "status": "string",
//     "device_token": "string"
// }
router.post('/registration/check', (req, res) => {
  res.send("<h1>Check Registration Hololens</h1>");
});

// POST /user/create
// Parameters:
// {
//     "token": "string",
//     "level": "string",
// }
// Body:
// {
//     "auth": "string"
//     "device": "string"
//     "rooms": "string[]",
//     "permission": "string"
// }
// Response:
// {
//     "token": "string",
//     "guest_code": "string"
// }
router.post('/user/create', (req, res) => {
  res.send("<h1>Create User</h1>");
});

// GET /user/guest?=code
// TODO: Guest code authentication check
router.get('/user/guest', (req, res) => {
  const guest_code = req.query.code;
  console.log("guest_code: " + guest_code);
  res.sendStatus(200);
});

// Websocket /signaling
// Payload:
// {
//     "command": "string", // "open", "close", "join", "leave", "get_config", "ready", "not_ready", "message", "report_data_usage"
//     "args": 
//     {
//         // open
//         "auto_join"<string>: "True","False",
//         // close
//         "room"<string>: "ABCDEF",
//         // join
//         "room"<string>: "ABCDEF",
//         // leave
//         "room"<string>: "ABCDEF",
//         // ready/not_ready
//         "room"<string>: "ABCDEF",
//         // message
//         "room"<string>: "ABCDEF",
//         "msg"<string>: "string"
//         // report_data_usage
//         "room"<string>: "ABCDEF",
//         "data"<string>: "data in bytes",
//     }
// }
router.ws('/signaling', async (ws, req) => {
  const path = pathParser(req.path);
  const guest_code = req.query.token;

  // Client connected 
  ws.on('connection', async (ws)=> {
    console.log('Client connected');
    console.log(`${yellow(path)} client ${guest_code} is connected.`);
    await roomEvent.sendRoomEvent(ws, { room_event: 'UserConnected', room_id: guest_code });
    // new User()
  });

  ws.on('message', async (msg) => {
    const message = JSON.parse(msg.toString())
    // console.log(`${yellow(path)} message was received: ${msg.toString()}`);

    switch (message.command) {
      case 'ping':
        await recvHeartbeat(ws)
        break;
      case 'open':
        console.log('Open received')
        break;
      case 'close':
        console.log('Close received')
        break;
      case 'join':
        console.log('Join received')
        break;
      case 'leave':
        console.log('Leave received')
        break;
      case 'get_config':
        console.log('Get config received')
        break;
      case 'ready':
        console.log('Ready received')
        await sendRoomEvent(ws, { room_event: 'OfferRequested', room_id: guest_code });
        break;
      case 'not_ready':
        console.log('Not ready received')
        break;
      case 'message':
        await signaling.onDirectMessage(ws,message.args)
        break;
      case 'report_data_usage':
        console.log('Report data usage received')
        break;
      default:
        console.log('Unknown command received')
        break;
    }
  });
});

