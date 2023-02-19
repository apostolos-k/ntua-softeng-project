const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const Questionnaire = require('../models/questionnaire');
const Answer = require('../models/answer');

/**
 * A new database with name "intelliQ-testing" is being created, 
 * with a document of a questionnaire. This new database is for 
 * test purposes only, so we do not mess with real user data to 
 * test our application. After testing is over, all the documents 
 * created are deleted.
 */
const MONGODB_URI = 'mongodb+srv://[username]:[password]n@cluster0.vypibbf.mongodb.net/intelliQ-testing?retryWrites=true&w=majority';

describe('POST Reset All Middleware', function () {
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
                const answer = new Answer({
                    questionnaireIDRef: 'TT000',
                    qIDRef: 'T00',
                    ans: 'T00T00',
                    session: 'TTTT'
                });
                return answer.save();
            })
            .then(() => {
                done();
            })
    });

    it('should send a response with status code 200 and status: "OK"', function (done) {
        request(app)
            .post('/intelliq_api/' + 'admin/resetall')
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res.status).to.eq(200);
                expect(res.body).to.have.property('status').eql('OK');
                done();
            })
    });

    after(function (done) {
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
