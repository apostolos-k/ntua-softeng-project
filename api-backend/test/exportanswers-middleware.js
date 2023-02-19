const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const Answer = require('../models/answer');

/**
 * A new database with name "intelliQ-testing" is being created, 
 * with a document of a questionnaire. This new database is for 
 * test purposes only, so we do not mess with real user data to 
 * test our application. After testing is over, all the documents 
 * created are deleted.
 */
const MONGODB_URI = 'mongodb+srv://[username]:[password]@cluster0.vypibbf.mongodb.net/intelliQ-testing?retryWrites=true&w=majority';

describe('GET Export Answers Middleware', function () {
    before(function (done) {
        mongoose
            .connect(MONGODB_URI)
            .then(result => {
                const answer = new Answer({
                    questionnaireIDRef: 'TT002',
                    qIDRef: 'T01',
                    ans: 'T01T01',
                    session: 'TTTT'
                });
                return answer.save();
            })
            .then(() => {
                done();
            });
    });

    let serverResponse;

    it('should send a response with status code 404 and message: "Endpoint not found."', function (done) {
        request(app)
            .get('/intelliq_api/' + 'exportanswers')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(404);
                expect(res.body).to.have.property('message').eql('Endpoint not found.');
                done();
            })
    });

    it('should send a response with status code 402 and message: "No questionnaire found."', function (done) {
        request(app)
            .get('/intelliq_api/' + 'exportanswers/' + 'TT001')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(402);
                expect(res.body).to.have.property('message').eql('No questionnaire found.');
                done();
            })
    });

    it('should send a response with status code 200', function (done) {
        request(app)
            .get('/intelliq_api/' + 'exportanswers/' + 'TT002')
            .end((err, res) => {
                serverResponse = res.body;
                expect(err).to.be.null;
                expect(res.status).to.eq(200);
                done();
            })
    });

    it('should be an array', function () {
        expect(serverResponse).to.be.an('array');
    });

    after(function (done) {
        Answer.deleteMany({})
            .then(() => {
                return mongoose.disconnect();
            })
            .then(() => {
                done();
            });
    });
});