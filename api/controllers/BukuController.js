/**
 * BukuController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    list_buku: function (req, res) {
        Buku.find({}).exec(function (err, buku) {
            if (err) {
                res.send(500, { error: "Database error" });
            }
            console.log(buku);

            res.view("pages/list_buku", { buku: buku });
        })
    },

    create_buku: function (req, res) {
        res.view("pages/buku/_create_buku");
    },

    store_buku: function (req, res) {
        var judul = req.body.judul;
        var keterangan = req.body.keterangan;

        Buku.create({ judul: judul, keterangan: keterangan }).exec(function (err) {
            if (err) {
                res.send(500, { error: "error input data " });
            } else {
                res.redirect('/list_buku');
            }
        });
    },

    wa: async function (req, res) {
        
    },

};

