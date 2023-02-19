const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const Questionnaire = require('../models/questionnaire');

/**
 * A new database with name "intelliQ-testing" is being created, 
 * with a document of a questionnaire. This new database is for 
 * test purposes only, so we do not mess with real user data to 
 * test our application. After testing is over, all the documents 
 * created are deleted.
 */
const MONGODB_URI = 'mongodb+srv://[username]:[password]@cluster0.vypibbf.mongodb.net/intelliQ-testing?retryWrites=true&w=majority';

describe('GET Questionnaire Middleware', function () {
    before(function (done) {
        mongoose
            .connect(MONGODB_URI)
            .then(result => {
                const questionnaire = new Questionnaire({
                    questionnaireID: 'TT000',
                    questionnaireTitle: 'Test Questionnaire',
                    keywords: ['Test1', 'Test2'],
                    questions: [
                        {
                            qID: 'T00',
                            qtext: 'Test Question',
                            required: 'Test',
                            type: 'Test',
                            options: [
                                {
                                    optID: 'T00T00',
                                    opttxt: 'Test Option',
                                    nextqID: 'T01'
                                }
                            ]
                        }
                    ]
                });
                return questionnaire.save();
            })
            .then(() => {
                done();
            });
    });

    let serverResponse;

    it('should send a response with status code 404 and message: "Endpoint not found."', function (done) {
        request(app)
            .get('/intelliq_api/' + 'questionnaire')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(404);
                expect(res.body).to.have.property('message').eql('Endpoint not found.');
                done();
            })
    });

    it('should send a response with status code 402 and message: "No questionnaire found."', function (done) {
        request(app)
            .get('/intelliq_api/' + 'questionnaire/' + 'TT001' + '?format=json')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(402);
                expect(res.body).to.have.property('message').eql('No questionnaire found.');
                done();
            })
    });

    it('should send a response with status code 200', function (done) {
        request(app)
            .get('/intelliq_api/' + 'questionnaire/' + 'TT000' + '?format=json')
            .end((err, res) => {
                serverResponse = res.body;
                expect(err).to.be.null;
                expect(res.status).to.eq(200);
                done();
            })
    });

    it('should be an object', function () {
        expect(serverResponse).to.be.an('object');
    });

    it('should have an attribute questionnireID', function () {
        expect(serverResponse).to.have.property('questionnaireID');
    });

    it('should have an attribute questionnireTitle', function () {
        expect(serverResponse).to.have.property('questionnaireTitle');
    });

    it('should have an attributes list keywords', function () {
        expect(serverResponse.keywords).to.be.not.empty;
    });

    it('should have an attributes list questions', function () {
        expect(serverResponse.questions).to.be.not.empty;
    });

    it('should have an attribute qID inside questions', () => {
        expect(serverResponse.questions[0]).to.have.property('qID');
    });

    it('should have an attribute qtext inside questions', () => {
        expect(serverResponse.questions[0]).to.have.property('qtext');
    });

    it('should have an attribute required inside questions', () => {
        expect(serverResponse.questions[0]).to.have.property('required');
    });

    it('should have an attribute type inside questions', () => {
        expect(serverResponse.questions[0]).to.have.property('type');
    });

    after(function (done) {
        Questionnaire.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});