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
            let page = req.query.page;
            let perPage = 15;
            if(req.query.page == 0 || req.query.page < 0 || req.query.page == undefined){
                page = 1
            }

            let contacts = await Contacts.find({}).sort('name ASC').limit(perPage).skip( (page - 1) * perPage);
            let count = await Contacts.count({});

            res.view('pages/contacts', { 
                active: 'contact', 
                contacts: contacts,
                current: page,
                pages: Math.ceil(count/perPage),
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

        let contact = await client.getContacts();
        for (let index = 0; index < contact.length; index++) {
            
            const element = contact[index];
            let myJSON = JSON.stringify(element);
            let obj = JSON.parse(myJSON);

            if (obj.number !== null) {
                let one = await Contacts.findOne({ server: obj.id.server, number: obj.number, name: obj.name });
                if(one == undefined){
                    await Contacts.create({ server: obj.id.server, number: obj.number, name: obj.name });
                }
            }

        }

        await client.destroy();
        sails.sockets.broadcast('contactsSockets', 'contacts', { contacts: 'ok' });
        return res.json({
            return: 'ok'
        });
    }
};

