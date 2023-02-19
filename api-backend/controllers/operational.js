var csv = require('csv-express');

const Questionnaire = require('../models/questionnaire');
const Answer = require('../models/answer');

/**
 * Questionnaire
 * ________________________________________________________________________________________________
 * 
 * Goal:
 * ________________________________________________________________________________________________
 * Returns an object (json/csv) containing attributes of a specific questionnaire, defined by 
 * it's ID, such as ID, title, keywords and a list of questions, sorted by each question's ID.
 * 
 * Endpoint:
 * ________________________________________________________________________________________________
 * {baseURL}/questionnaire/:questionnaireID
 * https://localhost:9103/intelliq_api/questionnaire/:questionnaireID
 * 
 * example:
 *      To show results in json format (always in json, if format not applied)
 *      https://localhost:9103/intelliq_api/questionnaire/QQ000
 *      https://localhost:9103/intelliq_api/questionnaire/QQ000?format=json
 *      To show results in csv format
 *      https://localhost:9103/intelliq_api/questionnaire/QQ000?format=csv
 * 
 * Functionality:
 * ________________________________________________________________________________________________
 * Parses data from the URL, which define the user's request. With these data, the right query
 * is performed, to retrieve the requested data from the database. The requested data are stored
 * in 'result' variable, which is returned as a promise to find({}). Then, the data are transfered
 * to the list 'questionnaire', wich contains the correct attribute names, as requested. Finally,
 * with the help of the function compare(a, b), the 'questions' list inside 'questionnaire' is 
 * sorted by each question's ID. If csv format is requested, the results are pushed in an array,
 * in order to be able to organise data in columns. Else, if json format is requested, a json file
 * is returned.
 * 
 * Error handling:
 * ________________________________________________________________________________________________
 * success:
 *  status: 200
 *  body: questionnaire
 * error in database:
 *  status: 402
 *  body: "message": "No questionnaire found."
 * error:
 *  status: 500
 *  body: "error": err (err is the decription of the error)
 */

exports.getQuestionnaire = (req, res, next) => {
    const questID = req.params.questionnaireID;
    const format = req.query.format;

    Questionnaire
        .find({ questionnaireID: questID }, { "questions.options": 0, "questions._id": 0 })
        .then(result => {
            if (result.length == 0) {
                return res.status(402).json({ message: "No questionnaire found." });
            }
            function compare(a, b) {
                if (a.qID < b.qID) {
                    return -1;
                }
                if (a.qID > b.qID) {
                    return 1;
                }
                return 0;
            }
            if (format == 'csv') {
                var questionnaire;
                var questionnaireArray = [];
                result.forEach(q => {
                    questionnaire = {
                        questionnaireID: q.questionnaireID,
                        questionnaireTitle: q.questionnaireTitle,
                        keywords: q.keywords,
                        questions: q.questions
                    }
                    questionnaire.questions.sort(compare);
                    questionnaireArray.push(questionnaire);
                })
                return res.csv(questionnaireArray, 200);
            }
            else {
                var questionnaire;
                result.forEach(q => {
                    questionnaire = {
                        questionnaireID: q.questionnaireID,
                        questionnaireTitle: q.questionnaireTitle,
                        keywords: q.keywords,
                        questions: q.questions
                    }
                })
                questionnaire.questions.sort(compare);
                return res.status(200).json({ ...questionnaire });
            }
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        });
};

/**
 * Question
 * ________________________________________________________________________________________________
 * 
 * Goal:
 * ________________________________________________________________________________________________
 * Returns an object (json/csv) containing attributes of a specific question, defined by it's ID 
 * and questionnaire's ID in which the question exists. The object contains attributes such as ID, 
 * title, keywords and a list of questions, sorted by each question's ID.
 * 
 * Endpoint:
 * ________________________________________________________________________________________________
 * {baseURL}/question/:questionnaireID/:question
 * https://localhost:9103/intelliq_api/question/:questionnaireID/:question
 * 
 * example:
 *      To show results in json format (always in json, if format not applied)
 *      https://localhost:9103/intelliq_api/question/QQ000/Q01
 *      https://localhost:9103/intelliq_api/question/QQ000/Q01?format=json
 *      To show results in csv format
 *      https://localhost:9103/intelliq_api/question/QQ000/Q01?format=csv
 * 
 * Functionality:
 * ________________________________________________________________________________________________
 * Parses data from the URL, which define the user's request. With these data, the right query
 * is performed, to retrieve the requested data from the database. The requested data are stored
 * in 'result' variable, which is returned as a promise to find({}). Then, the data are transfered
 * to the list 'question', wich contains the correct attribute names, as requested. Also, the _id
 * attribute is deleted from each 'options' list, because it is not requested to show on body. 
 * Finally, with the help of the function compare(a, b), the 'options' list inside 'question' is 
 * sorted by each option's ID. If csv format is requested, the results are pushed in an array, in 
 * order to be able to organise data in columns. Else, if json format is requested, a json file 
 * is returned.
 * 
 * Error handling:
 * ________________________________________________________________________________________________
 * success:
 *  status: 200
 *  body: question
 * error in database:
 *  status: 402
 *  body: "message": "No question found."
 * error:
 *  status: 500
 *  body: "error": err (err is the decription of the error)
 */

exports.getQuestion = (req, res, next) => {
    const questionnaireID = req.params.questionnaireID;
    const questionID = req.params.questionID;
    const format = req.query.format;

    Questionnaire
        .aggregate([
            { $match: { 'questions.qID': questionID, questionnaireID: questionnaireID } },
            {
                $project: {
                    questions: {
                        $filter: {
                            input: '$questions',
                            as: 'questions',
                            cond: { $eq: ['$$questions.qID', questionID] }
                        }
                    },
                    _id: 0
                }
            }
        ])
        .then(result => {
            if (result.length == 0) {
                return res.status(402).json({ message: "No question found." });
            }
            function compare(a, b) {
                if (a.optID < b.optID) {
                    return -1;
                }
                if (a.optID > b.optID) {
                    return 1;
                }
                return 0;
            }
            if (format == 'csv') {
                var question;
                var questionArray = [];
                result.forEach(q => {
                    question = {
                        questionnaireID: questionnaireID,
                        qID: q.questions[0].qID,
                        qtext: q.questions[0].qtext,
                        required: q.questions[0].required,
                        type: q.questions[0].type,
                        options: q.questions[0].options.map(it => [
                            it.optID,
                            it.opttxt,
                            it.nextqID
                        ])
                    }
                    var optionArrayLength = question.options.length;
                    for (let i = 0; i < optionArrayLength; i++) {
                        delete question.options[i]._id;
                    }
                    question.options.sort(compare);
                    questionArray.push(question);
                })
                return res.csv(questionArray, 200);
            }
            else {
                var question;
                result.forEach(q => {
                    question = {
                        questionnaireID: questionnaireID,
                        qID: q.questions[0].qID,
                        qtext: q.questions[0].qtext,
                        required: q.questions[0].required,
                        type: q.questions[0].type,
                        options: q.questions[0].options
                    }
                    var optionArrayLength = question.options.length;
                    for (let i = 0; i < optionArrayLength; i++) {
                        delete question.options[i]._id;
                    }
                })
                question.options.sort(compare);
                return res.status(200).json({ ...question });
            }
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        });
};

/**
 * Answer submit
 * ________________________________________________________________________________________________
 * 
 * Goal:
 * ________________________________________________________________________________________________
 * Save an asnwer document into answers collection. Various checking is done before uploading an
 * answer to the database, such as an existance check for questionnaire and question, and the 
 * ability for the specific user's session to answer that question based on previous answers and 
 * on previous questions required filed.
 * 
 * Endpoint:
 * ________________________________________________________________________________________________
 * {baseURL}/doanswer/:questionnaireID/:question/:session/:optionID
 * https://localhost:9103/intelliq_api/doanswer/:questionnaireID/:question/:session/:optionID
 * 
 * example:
 *      https://localhost:9103/intelliq_api/doanswer/QQ000/Q01/AAAA/Q01A1
 * 
 * Functionality:
 * ________________________________________________________________________________________________
 * Parses data from the URL, which define the user's request. With these data, the right query
 * is performed, to retrieve the requested data from the database. Two crucial checks are made.
 * If the user which wants to answer, answers his first question and if he does, if there are
 * previous answers which are required and remain unanswered. And if the user can answer that 
 * question, based on his previous answers. Finally, if user is able to answer the question, the 
 * answer is uploaded to the database and a json message is returned with that answer.
 * 
 * Error handling:
 * ________________________________________________________________________________________________
 * success:
 *  status: 200
 *  body: "message": "Answer Submited.", answer
 * error in database:
 *  status: 402
 *  body: "message": "Please check again your answer fields."
 * error when unanswered previous required questions:
 *  status: 402
 *  body: message: "Please answer required questions first."
 * error when unanswered question which leads to this question:
 *  status: 402
 *  body: message: "Cannot answer that question."
 * error:
 *  status: 500
 *  body: "error": err (err is the decription of the error)
 */

exports.postAnswer = (req, res, next) => {
    const questionnaireID = req.params.questionnaireID;
    const questionID = req.params.questionID;
    const session = req.params.session;
    const optionID = req.params.optionID;

    Questionnaire
        .find({
            questionnaireID: questionnaireID,
            questions: {
                $elemMatch: {
                    qID: questionID,
                    options: { $elemMatch: { optID: optionID } }
                }
            }
        })
        .then(result => {
            if (result.length == 0) {
                return res.status(402).json({ message: "Please check again your answer fields." });
            }
            Answer
                .find({
                    questionnaireIDRef: questionnaireID,
                    session: session
                })
                .then(apotel => {
                    /** 
                     * User's session visits the questionnaire for the first time, so check if user answers the first question, 
                     * then submit the answer and return "message": "Answer Submited."
                     * if not, check all the previous questions' required fileds. If previous questions are required 
                     * then returns "message": "Please answer required questions first."
                     */
                    if (apotel.length == 0) {
                        let firstQuestion;
                        let firstQuestionRequired;
                        let questionsNumber;
                        let i = 0;
                        let j = -1;
                        result.forEach(re => {
                            firstQuestion = re.questions[i].qID,
                                firstQuestionRequired = re.questions[i].required,
                                questionsNumber = re.questions.length;
                        })
                        if (questionID == firstQuestion) {
                            const answer = new Answer({
                                questionnaireIDRef: questionnaireID,
                                qIDRef: questionID,
                                ans: optionID,
                                session: session
                            });
                            answer
                                .save()
                                .then(result => {
                                    console.log('Answer Submited.');
                                    return res.status(200).json({ message: "Answer Submited.", answer });
                                })
                                .catch(err => {
                                    console.log(err);
                                    return res.status(500).json({ error: err });
                                })
                        }
                        else {
                            for (i = 1; i < questionsNumber; i++) {
                                j++;
                                result.forEach(re => {
                                    firstQuestion = re.questions[i].qID,
                                        firstQuestionRequired = re.questions[j].required
                                })
                                if (questionID != firstQuestion) {
                                    if (firstQuestionRequired == 'TRUE') {
                                        return res.status(402).json({ message: "Please answer required questions first." });
                                    }
                                }
                                else if (questionID == firstQuestion) {
                                    if (firstQuestionRequired == 'TRUE') {
                                        return res.status(402).json({ message: "Please answer required questions first." });
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            const answer = new Answer({
                                questionnaireIDRef: questionnaireID,
                                qIDRef: questionID,
                                ans: optionID,
                                session: session
                            });
                            answer
                                .save()
                                .then(result => {
                                    console.log('Answer Submited.');
                                    return res.status(200).json({ message: "Answer Submited.", answer });
                                })
                                .catch(err => {
                                    console.log(err);
                                    return res.status(500).json({ error: err });
                                })
                        }
                    }
                    /**
                     * User's session made previous answers on this questionnaire. If user made an answer on a previous
                     * question which leads (nextqID of previous question matches the question's ID user wants to answer)
                     * him to the quetion he wants to answer, then submit the answer and return "message": "Answer Submited."
                     * Else return "message": "Cannot answer that question."
                     */
                    else {
                        Questionnaire
                            .find({
                                questionnaireID: questionnaireID,
                                questions: { $elemMatch: { options: { $elemMatch: { nextqID: questionID } } } },
                            },
                                { "questions.$": 1, _id: 0 }
                            )
                            .then(resp => {
                                let previousQuestion;
                                resp.forEach(r => {
                                    previousQuestion = r.questions[0].qID
                                })
                                Answer
                                    .find({
                                        questionnaireIDRef: questionnaireID,
                                        qIDRef: previousQuestion,
                                        session: session
                                    })
                                    .then(ap => {
                                        if (ap.length == 0) {
                                            return res.status(402).json({ message: "Cannot answer that question." });
                                        }
                                        let answerToPreviousQuestion;
                                        ap.forEach(a => {
                                            answerToPreviousQuestion = a.ans;
                                        })
                                        Questionnaire
                                            .find({
                                                questionnaireID: questionnaireID,
                                                "questions": {
                                                    $elemMatch: {
                                                        qID: previousQuestion
                                                    }
                                                },
                                                "questions.options": {
                                                    $elemMatch: {
                                                        optID: answerToPreviousQuestion,
                                                        nextqID: questionID
                                                    }
                                                }
                                            })
                                            .then(telos => {
                                                if (telos.length == 0) {
                                                    return res.status(402).json({ message: "Cannot answer that question." });
                                                }
                                                else {
                                                    const answer = new Answer({
                                                        questionnaireIDRef: questionnaireID,
                                                        qIDRef: questionID,
                                                        ans: optionID,
                                                        session: session
                                                    });
                                                    answer
                                                        .save()
                                                        .then(result => {
                                                            console.log('Answer Submited.');
                                                            return res.status(200).json({ message: "Answer Submited.", answer });
                                                        })
                                                        .catch(err => {
                                                            console.log(err);
                                                            return res.status(500).json({ error: err });
                                                        })
                                                }
                                            })
                                    })
                            })
                    }
                })
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        });
};

/**
 * Answers by Session
 * ________________________________________________________________________________________________
 * 
 * Goal:
 * ________________________________________________________________________________________________
 * Returns an object (json/csv) containing all the answers of a specific questionnaire, defined by 
 * it's ID, given to all the questions by a specific user's session. The object contains attributes 
 * such as questionnaire's ID, user's session and the list of the answers given, sorted by each 
 * answer's question ID.
 * 
 * Endpoint:
 * ________________________________________________________________________________________________
 * {baseURL}/getsessionanswers/:questionnaireID/:session
 * https://localhost:9103/intelliq_api/getsessionanswers/:questionnaireID/:session
 * 
 * example:
 *      To show results in json format (always in json, if format not applied)
 *      https://localhost:9103/intelliq_api/getsessionanswers/QQ000/AAAA
 *      https://localhost:9103/intelliq_api/getsessionanswers/QQ000/AAAA?format=json
 *      To show results in csv format
 *      https://localhost:9103/intelliq_api/getsessionanswers/QQ000/AAAA?format=csv
 * 
 * Functionality:
 * ________________________________________________________________________________________________
 * Parses data from the URL, which define the user's request. With these data, the right query
 * is performed, to retrieve the requested data from the database. The requested data are stored
 * in 'result' variable, which is returned as a promise to find({}). Then, from the requested data,
 * an array 'answersArray' is created, which contains all the answers returned from the query, 
 * formated with the correct attributes as requested (qID, ans). The array then is sorted by each 
 * question's ID with the help of function compare (a, b). Next, the returned data and the array 
 * are transfered to the list 'ans', wich contains the correct attribute names, as requested. If 
 * csv format is requested, the results are pushed in an array, in order to be able to organise 
 * data in columns. Else, if json format is requested, a json file is returned.
 * 
 * Error handling:
 * ________________________________________________________________________________________________
 * success:
 *  status: 200
 *  body: answer
 * error in database:
 *  status: 402
 *  body: "message": "No answers found."
 * error:
 *  status: 500
 *  body: "error": err (err is the decription of the error)
 */

exports.getSessionAnswers = (req, res, next) => {
    const questionnaireID = req.params.questionnaireID;
    const session = req.params.session;
    const format = req.query.format;

    Answer
        .find({ questionnaireIDRef: questionnaireID, session: session })
        .then(result => {
            if (result.length == 0) {
                return res.status(402).json({ message: "No answers found." });
            }
            var answer;
            var answersArray = [];
            result.forEach(a => {
                answer = {
                    qID: a.qIDRef,
                    ans: a.ans
                }
                answersArray.push(answer);
            })
            function compare(a, b) {
                if (a.qID < b.qID) {
                    return -1;
                }
                if (a.qID > b.qID) {
                    return 1;
                }
                return 0;
            }
            answersArray.sort(compare);

            if (format == 'csv') {
                var ans;
                var ansArray = [];
                ans = {
                    questionnaireID: questionnaireID,
                    session: session,
                    answers: answersArray.map(it => [
                        it.qID,
                        it.ans
                    ])
                }
                ansArray.push(ans);
                return res.csv(ansArray, 200);
            }
            else {
                var ans = {
                    questionnaireID: questionnaireID,
                    session: session,
                    answers: answersArray
                }
                return res.status(200).json({ ...ans });
            }
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        });
};

/**
 * Answers by Question
 * ________________________________________________________________________________________________
 * 
 * Goal:
 * ________________________________________________________________________________________________
 * Returns an object (json/csv) containing all the answers of a specific questionnaire, defined by 
 * it's ID, given by a all user's sessions for a specific question. The object contains attributes 
 * such as questionnaire's ID, question's ID and the list of the answers given, sorted by the time
 * each answer is given (first answer is the oldest).
 * 
 * Endpoint:
 * ________________________________________________________________________________________________
 * {baseURL}/getquestionanswers/:questionnaireID/:questionID
 * https://localhost:9103/intelliq_api/getquestionanswers/:questionnaireID/:questionID
 * 
 * example:
 *      To show results in json format (always in json, if format not applied)
 *      https://localhost:9103/intelliq_api/getquestionanswers/QQ000/Q01
 *      https://localhost:9103/intelliq_api/getquestionanswers/QQ000/Q01?format=json
 *      To show results in csv format
 *      https://localhost:9103/intelliq_api/getquestionanswers/QQ000/Q01?format=csv
 * 
 * Functionality:
 * ________________________________________________________________________________________________
 * Parses data from the URL, which define the user's request. With these data, the right query
 * is performed, to retrieve the requested data from the database. The requested data are stored
 * in 'result' variable, which is returned as a promise to find({}). Then, from the requested data,
 * an array 'answersArray' is created, which contains all the answers returned from the query, 
 * formated with the correct attributes as requested (session, ans). Next, the returned data and 
 * the array are transfered to the list 'ans', wich contains the correct attribute names, as 
 * requested. If csv format is requested, the results are pushed in an array, in order to be able 
 * to organise data in columns. Else, if json format is requested, a json file is returned.
 * 
 * Error handling:
 * ________________________________________________________________________________________________
 * success:
 *  status: 200
 *  body: answer
 * error in database:
 *  status: 402
 *  body: "message": "No answers found."
 * error:
 *  status: 500
 *  body: "error": err (err is the decription of the error)
 */

exports.getQuestionAnswers = (req, res, next) => {
    const questionnaireID = req.params.questionnaireID;
    const questionID = req.params.questionID;
    const format = req.query.format;

    Answer
        .find({ questionnaireIDRef: questionnaireID, qIDRef: questionID })
        .then(result => {
            if (result.length == 0) {
                return res.status(402).json({ message: "No answers found." });
            }
            var answer;
            var answersArray = [];
            result.forEach(a => {
                answer = {
                    session: a.session,
                    ans: a.ans
                }
                answersArray.push(answer);
            })

            if (format == 'csv') {
                var ans;
                var ansArray = [];
                ans = {
                    questionnaireID: questionnaireID,
                    questionID: questionID,
                    answers: answersArray.map(it => [
                        it.session,
                        it.ans
                    ])
                }
                ansArray.push(ans);
                return res.csv(ansArray, 200);
            }
            else {
                var ans = {
                    questionnaireID: questionnaireID,
                    questionID: questionID,
                    answers: answersArray
                }
                return res.status(200).json({ ...ans });
            }
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        });
};

/**
 * Use case: export csv/json with answers
 * ________________________________________________________________________________________________
 * 
 * Goal:
 * ________________________________________________________________________________________________
 * Returns a json array (to be compatile with the front-end) containing all the answers of a 
 * specific questionnaire, defined by it's ID. The array contains attributes such as the IDs of
 * the questions and the answer given in each question.
 * 
 * Endpoint:
 * ________________________________________________________________________________________________
 * {baseURL}/exportanswers/:questionnaireID
 * https://localhost:9103/intelliq_api/exportanswers/:questionnaireID
 * 
 * example:
 *      https://localhost:9103/intelliq_api/exportanswers/QQ000
 * 
 * Functionality:
 * ________________________________________________________________________________________________
 * Parses data from the URL, which define the user's request. With these data, the right query
 * is performed, to retrieve the requested data from the database. The requested data are stored
 * in 'result' variable, which is returned as a promise to find({}). Then, from the requested data,
 * an array 'answersArray' is created, containing as elements each individual question with it's
 * answer. Finally, the array is sorted by each question's ID with the help of function 
 * compare (a, b) and then is returned as a json array.
 * 
 * Error handling:
 * ________________________________________________________________________________________________
 * success:
 *  status: 200
 *  body: answer
 * error in database:
 *  status: 402
 *  body: "message": "No questionnaire found."
 * error:
 *  status: 500
 *  body: "error": err (err is the decription of the error)
 */

exports.getExportAnswers = (req, res, next) => {
    const questionnaireID = req.params.questionnaireID;

    Answer
        .find({ questionnaireIDRef: questionnaireID })
        .then(result => {
            if (result.length == 0) {
                return res.status(402).json({ message: "No questionnaire found." });
            }
            function compare(a, b) {
                if (a.questionID < b.questionID) {
                    return -1;
                }
                if (a.questionID > b.questionID) {
                    return 1;
                }
                return 0;
            }
            var answer;
            var answersArray = [];
            result.forEach(a => {
                answer = {
                    questionID: a.qIDRef,
                    ans: a.ans
                }
                answersArray.push(answer);
            })
            answersArray.sort(compare);
            return res.status(200).json(answersArray);
        })
        .catch(err => {
            return res.status(500).json({ error: err });
        });
};