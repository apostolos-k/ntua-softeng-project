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

describe('GET Question Middleware', function () {
    before(function (done) {
        mongoose
            .connect(MONGODB_URI)
            .then(result => {
                const questionnaire = new Questionnaire({
                    questionnaireID: 'TT001',
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
                        },
                        {
                            qID: 'T01',
                            qtext: 'Test Question',
                            required: 'Test',
                            type: 'Test',
                            options: [
                                {
                                    optID: 'T01T00',
                                    opttxt: 'Test Option',
                                    nextqID: 'T02'
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
            .get('/intelliq_api/' + 'question')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(404);
                expect(res.body).to.have.property('message').eql('Endpoint not found.');
                done();
            })
    });

    it('should send a response with status code 402 and message: "No question found."', function (done) {
        request(app)
            .get('/intelliq_api/' + 'question/' + 'TT001/' + 'T02' + '?format=json')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(402);
                expect(res.body).to.have.property('message').eql('No question found.');
                done();
            })
    });

    it('should send a response with status code 200', function (done) {
        request(app)
            .get('/intelliq_api/' + 'question/' + 'TT001/' + 'T00' + '?format=json')
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

    it('should have an attribute questionID', function () {
        expect(serverResponse).to.have.property('questionnaireID');
    });

    it('should have an attribute qID', function () {
        expect(serverResponse).to.have.property('qID');
    });

    it('should have an attribute qtext', function () {
        expect(serverResponse).to.have.property('qtext');
    });

    it('should have an attribute required', function () {
        expect(serverResponse).to.have.property('required');
    });

    it('should have an attribute type', () => {
        expect(serverResponse).to.have.property('type');
    });

    it('should have an attributes list options', function () {
        expect(serverResponse.options).to.be.not.empty;
    });

    it('should have an attribute optID inside options', () => {
        expect(serverResponse.options[0]).to.have.property('optID');
    });

    it('should have an attribute opttxt inside options', () => {
        expect(serverResponse.options[0]).to.have.property('opttxt');
    });

    it('should have an attribute nextqID inside options', () => {
        expect(serverResponse.options[0]).to.have.property('nextqID');
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