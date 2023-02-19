const express = require('express');
const multer = require('multer');

const app = express();

const adminRoutes = require('./routes/admin');
const operationalRoutes = require('./routes/operational');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../data');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use(multer({ storage: fileStorage }).single('file'));
app.use('/intelliq_api/admin', adminRoutes);
app.use('/intelliq_api', operationalRoutes);
app.use((req, res, next) => { 
    res.status(404).json({ message: 'Endpoint not found.' }); 
});

module.exports = app;