const app = require('./app');
const mongoose = require('mongoose');

var fs = require('fs');
var https = require('https');

const MONGODB_URI =
    'mongodb+srv://[username]:[password]@cluster0.vypibbf.mongodb.net/intelliQ?retryWrites=true&w=majority';

const privateKey = fs.readFileSync('ssl/server.key');
const certificate = fs.readFileSync('ssl/server.cert');

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        console.log('Successfully Connected!');
        https
            .createServer({ key: privateKey, cert: certificate }, app)
            .listen(9103);
    })
    .catch(err => {
        console.log(err);
    });

module.exports = app;