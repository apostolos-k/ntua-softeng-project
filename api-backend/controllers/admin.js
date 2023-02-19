const path = require('path');

const Questionnaire = require('../models/questionnaire');
const Answer = require('../models/answer');

const connected = require("../util/dbconnection");

/**  
 * Healthcheck
 * ________________________________________________________________________________________________ 
 * 
 * Goal:  
 * ________________________________________________________________________________________________ 
 * Confirms end-to-end connectivity between the user and the database.
 * 
 * Endpoint:   
 * ________________________________________________________________________________________________ 
 * {baseURL}/admin/healthcheck
 * https://localhost:9103/intelliq_api/admin/healthcheck
 * 
 * Functionality:    
 * ________________________________________________________________________________________________ 
 * If connected, backend returns:  
 * "status": "OK", "dbconnection": "mongodb+srv://admin:admin@cluster0"
 * 
 * If not connected, backend returns:  
 * "status": "failed", "dbconnection": "mongodb+srv://admin:admin@cluster0"
 * 
 * Error handling:
 * ________________________________________________________________________________________________
 * success:
 *  status: 200
 *  body: "status": "OK", "dbconnection": "mongodb+srv://admin:admin@cluster0"
 * error:
 *  status: 500
 *  body: "status": "failed", "dbconnection": "mongodb+srv://admin:admin@cluster0"
 */

exports.getHealthCheck = (req, res, next) => {
    if (connected() == 1) {
        return res
            .status(200)
            .json({ "status": "OK", "dbconnection": "mongodb+srv://admin:admin@cluster0" });
    }
    if (connected() == 0) {
        return res
            .status(500)
            .json({ "status": "failed", "dbconnection": "mongodb+srv://admin:admin@cluster0" });
    }
};

/** 
 * Update questionnaire
 * ________________________________________________________________________________________________ 
 * 
 * Goal:  
 * ________________________________________________________________________________________________ 
 * Updates the database collection dedicated to the questionnaires, with a new questionnaire,
 * given as a json file.
 * 
 * Endpoint:  
 * ________________________________________________________________________________________________ 
 * {baseURL}/admin/questionnaire_upd
 * https://localhost:9103/intelliq_api/admin/questionnaire_upd
 * 
 * Functionality:  
 * ________________________________________________________________________________________________ 
 * Inserts data from a JSON file containing questionnaire data into the mongoDB database, using 
 * mongoose. It checks if a file is uploaded, and if not, it returns an error response. If a file 
 * is uploaded, with the help of multer is stored in the local starage (data folder). Then it reads 
 * the file path and loads the contents of the file into a JavaScript object using require(). It 
 * then uses the mongoose's insertMany({}) method to insert the data into the database. If the 
 * insertion is successful, it returns a json message, else a json message with the error is 
 * returned.
 * 
 * Error handling: 
 * ________________________________________________________________________________________________  
 * succes:    
 *  status: 200
 *  body: "status": "OK"
 * error in file field:  
 *  status: 422
 *  body: "status": "failed", "reason": "No file provided."
 * error:
 *  status: 500
 *  body: "status": "failed", "reason": error
 */

exports.postQuestionnaireUpd = (req, res, next) => {
    if (!req.file) {
        console.log("No file provided.");
        return res.status(422).json({ "status": "failed", "reason": "No file provided." });
    }
    const filePath = req.file.path;
    const questionnaireJSON = require(path.join(__dirname, '..', filePath));
    Questionnaire
        .insertMany(questionnaireJSON)
        .then(result => {
            console.log("Data inserted from JSON file");
            return res.status(200).json({ "status": "OK" });
        })
        .catch(error => {
            console.log(error);
            return res.status(500).json({ "status": "failed", "reason": error });
        });
};

/** 
 * Reset questionnaires and answers
 * ________________________________________________________________________________________________ 
 * 
 * Goal:  
 * ________________________________________________________________________________________________ 
 * Deletes all questionnaires and answers in the database, by deleting all the documents in their 
 * collections.
 * 
 * Endpoint:  
 * ________________________________________________________________________________________________ 
 * {baseURL}/admin/resetall  
 * https://localhost:9103/intelliq_api/admin/resetall  
 * 
 * Functionality:  
 * ________________________________________________________________________________________________ 
 * It uses mongoose's deleteMany({}) method to delete all documents in the questionnaire and 
 * answer collections. It logs a message to the console when the deletions are successful. Finally, 
 * returns a json object message, else if an error occured a json message with the error is 
 * returned.
 * 
 * Error handling:  
 * ________________________________________________________________________________________________ 
 * success:    
 *  status: 200
 *  body: "status": "OK"
 * error 
 *  status: 500
 *  body: "status": "failed", "reason": error
 */

exports.postResetAll = async (req, res, next) => {
    try {
        Questionnaire
            .deleteMany({})
            .then(result => {
                console.log("Questionnaires deleted.");
            })
            .catch(err => {
                console.log(err);
            });
        Answer
            .deleteMany({})
            .then(result => {
                console.log("Answers deleted.");
            })
            .catch(err => {
                console.log(err);
            });
        return res.status(200).json({ "status": "OK" });
    } catch (error) {
        return res.status(500).json({ "status": "failed", "reason": error });
    }
};

/** 
 * Reset answers
 * ________________________________________________________________________________________________ 
 * 
 * Goal:  
 * ________________________________________________________________________________________________ 
 * Deletes all the answers of a specific questionnaire in the database, by deleting all the 
 * documents in the answers collections.
 * 
 * Endpoint:  
 * ________________________________________________________________________________________________ 
 * {baseURL}/admin/resetq/:questionnaireID
 * https://localhost:9103/intelliq_api/admin/resetq/:questionnaireID
 * 
 * example:
 *      https://localhost:9103/intelliq_api/admin/resetq/QQ000
 * 
 * Functionality:  
 * ________________________________________________________________________________________________ 
 * It checks if there is a questionnaire in the database with the given id, and if not it returns
 * an error message. If the questionnaire exists, all the answers associated with it are deleted,
 * with the help of mongoose's deleteMany({}) function. Finally, returns a json object message, 
 * else if an error occured a json message with the error is returned. 
 * 
 * Error handling:  
 * ________________________________________________________________________________________________ 
 * succes:
 *  status: 200
 *  body: "status": "OK"   
 * error in database:
 *  status: 402
 *  body: "message": "No questionnaire found."
 * error:
 *  status: 500
 *  body: "status": "failed", "reason": error
 */

exports.postResetQ = (req, res, next) => {
    const questID = req.params.questionnaireID;
    Questionnaire
        .find({ questionnaireID: questID })
        .then(result => {
            if (result.length == 0) {
                return res.status(402).json({ message: "No questionnaire found." });
            }
            Answer
                .deleteMany({ questionnaireIDRef: questID })
                .then(result => {
                    console.log("Answers deleted.");
                })
                .catch(err => {
                    console.log(err);
                });
            return res.status(200).json({ "status": "OK" });
        })
        .catch(error => {
            return res.status(500).json({ "status": "failed", "reason": error });
        })
}; 