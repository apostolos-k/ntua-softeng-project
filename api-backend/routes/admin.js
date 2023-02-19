const express = require('express');
const multer = require('multer');

const adminController = require('../controllers/admin');

const router = express.Router();

// Documentation is avaliable by hovering over each controller's name

router.get('/healthcheck', adminController.getHealthCheck);

router.post('/questionnaire_upd', adminController.postQuestionnaireUpd);

router.post('/resetall', adminController.postResetAll);

router.post('/resetq/:questionnaireID', adminController.postResetQ);

module.exports = router;