const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const Answer = require('../models/answer');
const Questionnaire = require('../models/questionnaire');

/**
 * A new database with name "intelliQ-testing" is being created, 
 * with a document of a questionnaire. This new database is for 
 * test purposes only, so we do not mess with real user data to 
 * test our application. After testing is over, all the documents 
 * created are deleted.
 */
const MONGODB_URI = 'mongodb+srv://[username]:[password]@cluster0.vypibbf.mongodb.net/intelliQ-testing?retryWrites=true&w=majority';

describe('POST Answer Middleware', function () {
    before(function(done) {
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

    it('should send a response with status code 404 and message: "Endpoint not found."', function(done) {
        request(app)
        .post('/intelliq_api/' + 'doanswer')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.eq(404);
            expect(res.body).to.have.property('message').eql('Endpoint not found.');
            done();
        })
    });
  
    it('should send a response with status code 402 and message: "Please check again your answer fields."', function(done) {
        request(app)
        .post('/intelliq_api/' + 'doanswer/' + 'TT000/' + 'T00/' + 'TTTT/' + 'T00T01')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.eq(402);
            expect(res.body).to.have.property('message').eql('Please check again your answer fields.');
            done();
        })
    });
  
    it('should send a response with status code 200', function(done) {
        request(app)
        .post('/intelliq_api/' + 'doanswer/' + 'TT000/' + 'T00/' + 'TTTT/' + 'T00T00')
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

    it('should have a message: "Answer Submited"', function() {
        expect(serverResponse).to.have.property('message').eql('Answer Submited.');
    });

    it('should have an object answers', function() {
        expect(serverResponse.answer).to.be.not.empty;
    });

    it('should have a questionnaireIDRef equal to TT000', function() {
        expect(serverResponse.answer).to.have.property('questionnaireIDRef').eql('TT000');
    });

    it('should have a qIDRef equal to T00', function() {
        expect(serverResponse.answer).to.have.property('qIDRef').eql('T00');
    });

    it('should have an ans equal to T00T00', function() {
        expect(serverResponse.answer).to.have.property('ans').eql('T00T00');
    });

    it('should have a session equal to TTTT', function() {
        expect(serverResponse.answer).to.have.property('session').eql('TTTT');
    });

    after(function(done) {
        Answer.deleteMany({}).then();
        Questionnaire.deleteMany({})
          .then(() => {
            return mongoose.disconnect();
          })
          .then(() => {
            done();
          });
      });
});