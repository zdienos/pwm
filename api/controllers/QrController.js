/**
 * QrController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const fs = require('fs');
const { Client, Location, Chat } = require('./WaControllerController');
session = async () => {
    let SESSION_FILE_PATH = await Session.find({}).sort('createdAt DESC').limit(1);
    let sessionCfg;

    if (SESSION_FILE_PATH.length > 0) {
        for (let index = 0; index < SESSION_FILE_PATH.length; index++) {
            sessionCfg = SESSION_FILE_PATH[index].value;
        }
    }

    return sessionCfg;
}

module.exports = {
    show: async function (req, res) {
        res.view("pages/wa");
    },

    getQr: async function (req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }

        sails.sockets.join(req, 'qrSockets');

        let ses = await session();
        
        const client = new Client({ puppeteer: { headless: true }, session: ses });
        client.initialize();

        client.on('qr', (qr) => {
            sails.sockets.broadcast('qrSockets', 'qr', {qr: qr} );
        });

        client.on('ready', () => {
            // console.log('AUTHENTICATED', 'READY');
            sails.sockets.broadcast('qrSockets', 'qr', {msg: 'READY'});
        });

        client.on('authenticated', (sessions) => {
            // console.log('AUTHENTICATED', sessions);
            if (ses == undefined) {
                Session.create({ value: sessions }).exec(function (err) {
                    if (err) {
                        sails.sockets.broadcast('qrSockets', 'qr', {msg: 'GAGAL MENYIMPAN SESSION'});
                    }
                });
            }
        });

        client.on('auth_failure', msg => {
            // Fired if session restore was unsuccessfull
            sails.sockets.broadcast('qrSockets', 'qr', {msg: msg});
        });
    }
    // hello: function (req, res) {

    //     // Make sure this is a socket request (not traditional HTTP)
    //     if (!req.isSocket) {
    //         return res.badRequest();
    //     }

    //     // Have the socket which made the request join the "funSockets" room.
    //     sails.sockets.join(req, 'funSockets');

    //     // Broadcast a notification to all the sockets who have joined
    //     // the "funSockets" room, excluding our newly added socket:
    //     sails.sockets.broadcast('funSockets', 'hello', { howdy: 'hi there!' }, req);

    //     // ^^^
    //     // At this point, we've blasted out a socket message to all sockets who have
    //     // joined the "funSockets" room.  But that doesn't necessarily mean they
    //     // are _listening_.  In other words, to actually handle the socket message,
    //     // connected sockets need to be listening for this particular event (in this
    //     // case, we broadcasted our message with an event name of "hello").  The
    //     // client-side code you'd need to write looks like this:
    //     // 
    //     //   io.socket.on('hello', function (broadcastedData){
    //     //       console.log(data.howdy);
    //     //       // => 'hi there!'
    //     //   }
    //     // 

    //     // Now that we've broadcasted our socket message, we still have to continue on
    //     // with any other logic we need to take care of in our action, and then send a
    //     // response.  In this case, we're just about wrapped up, so we'll continue on

    //     // Respond to the request with a 200 OK.
    //     // The data returned here is what we received back on the client as `data` in:
    //     // `io.socket.get('/say/hello', function gotResponse(data, jwRes) { /* ... */ });`
    //     return res.json({
    //         webSocketId: sails.sockets.getId(req),
    //         anyData: 'we want to send back'
    //     });

    // }

};

