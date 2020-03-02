/**
 * ContactsController
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
        if (ses) {
            let contacts = await Contacts.find({});

            let myJSON = JSON.stringify(contacts);
            let obj = JSON.parse(myJSON);

            res.view('pages/contacts', { 
                active: 'contact', 
                data: obj,
                javascript: '<script src="/js/contacts.js"></script>'
            });
        } else {
            res.redirect('/login');
        }
    },

    get_contacts: async function (req, res) {
        if (!req.isSocket) {
            return res.badRequest();
        }
        sails.sockets.join(req, 'contactsSockets');

        let ses = await session();
        const client = new Client({ puppeteer: { headless: true }, session: ses });
        await client.initialize();
        
        await Contacts.destroy({});
        let contacts = await client.getContacts();
        for (let index = 0; index < contacts.length; index++) {
            const element = contacts[index];
            console.log(element);
            await Contacts.create({ contact: element }).exec(function (err) {
                if (err) {
                    console.log(error);
                }
            });
        }
        client.destroy();
        sails.sockets.broadcast('contactsSockets', 'contacts', { contacts: 'ok' });
    }
};

