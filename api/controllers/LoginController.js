/**
 * LoginController
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

    index: async function (req, res) {
        let ses = await session();
        res.view("pages/login", {
            session: ses,
            active: 'login',
            javascript: '<script src="/js/login.js"></script>'
        });
    },

    get_qr: async function (req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }
        sails.sockets.join(req, 'qrSockets');

        let ses = await session();
        const client = new Client({ puppeteer: { headless: false }, session: ses });
        client.initialize();

        client.on('qr', (qr) => {
            try {
                sails.sockets.broadcast('qrSockets', 'qr', { qr: qr });
            } catch (error) {
                console.log(error);
            }
        });

        client.on('ready', () => {
            try {
                sails.sockets.broadcast('qrSockets', 'qr', { msg: 'Whatsapp is Ready' });
                client.destroy();
            } catch (error) {
                console.log(error);
            }
        });

        client.on('authenticated', (sessions) => {
            // console.log('AUTHENTICATED', sessions);
            if (ses == undefined) {
                Session.create({ value: sessions }).exec(function (err) {
                    if (err) {
                        try {
                            sails.sockets.broadcast('qrSockets', 'qr', { msg: 'GAGAL MENYIMPAN SESSION' });
                        } catch (error) {
                            console.log(error);
                        }
                    }
                });
            }
        });

        client.on('auth_failure', msg => {
            // Fired if session restore was unsuccessfull
            try {
                sails.sockets.broadcast('qrSockets', 'qr', { msg: msg });
            } catch (error) {
                console.log(error);
            }
        });
    },

};

