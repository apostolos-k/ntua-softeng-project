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

describe('POST Questionnaire Update Middleware', function () {
    before(function(done) {
        mongoose
          .connect(MONGODB_URI)
          .then(() => {
            done();
          });
    });

    it('should send a response with status code 422 and status: "failed", reason: "No file provided."', function(done) {
      request(app)
      .post('/intelliq_api/' + 'admin/questionnaire_upd')
      .attach('file', '')
      .end((err, res) => {
          expect(err).to.be.null;
          expect(res.status).to.eq(422);
          expect(res.body).to.have.property('status').eql('failed');
          expect(res.body).to.have.property('reason').eql('No file provided.');
          done();
      })
    });

    it('should send a response with status code 500 and status: "failed", name: "ValidationError"', function(done) {
      request(app)
      .post('/intelliq_api/' + 'admin/questionnaire_upd')
      .attach('file', '/Users/apostoliskolios/Developer/VS Code Projects/SoftEng22-60/SoftEng22-60/data/questionnaire-invalid.json')
      .end((err, res) => {
          expect(err).to.be.null;
          expect(res.status).to.eq(500);
          expect(res.body).to.have.property('status').eql('failed');
          expect(res.body.reason).to.have.property('name').eql('ValidationError');
          done();
      })
    });

    it('should send a response with status code 200 and status: "OK"', function(done) {
        request(app)
        .post('/intelliq_api/' + 'admin/questionnaire_upd')
        .attach('file', '/Users/apostoliskolios/Developer/VS Code Projects/SoftEng22-60/SoftEng22-60/data/questionnaire.json')
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res.status).to.eq(200);
            expect(res.body).to.have.property('status').eql('OK');
            done();
        })
    });

    after(function(done) {
        Questionnaire.deleteMany({})
          .then(() => {
            return mongoose.disconnect();
          })
          .then(() => {
            done();
          });
      });
});