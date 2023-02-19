const express = require('express');

const operationalController = require('../controllers/operational');

const router = express.Router();

// Documentation is avaliable by hovering over each controller's name
 
router.get('/questionnaire/:questionnaireID', operationalController.getQuestionnaire);

router.get('/question/:questionnaireID/:questionID', operationalController.getQuestion);

router.post('/doanswer/:questionnaireID/:questionID/:session/:optionID', operationalController.postAnswer);

router.get('/getsessionanswers/:questionnaireID/:session', operationalController.getSessionAnswers);

router.get('/getquestionanswers/:questionnaireID/:questionID', operationalController.getQuestionAnswers);

// Use case: export csv/json with answers
router.get('/exportanswers/:questionnaireID', operationalController.getExportAnswers);

module.exports = router;