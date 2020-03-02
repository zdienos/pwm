/**
 * HomeController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fs = require('fs');
const { Client } = require('./WaControllerController');

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
        if(ses){
            res.view('pages/homepage', { 
                active: 'home',
                javascript: ''
            });
        }else{
            res.redirect('/login');
        }
    },

};

