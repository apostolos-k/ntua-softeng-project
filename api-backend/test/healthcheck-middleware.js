const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const MONGODB_URI = 'mongodb+srv://[username]:[password]@cluster0.vypibbf.mongodb.net/intelliQ-testing?retryWrites=true&w=majority';

describe('GET Healthcheck Middleware', function () {
  before(function (done) {
    mongoose
      .connect(MONGODB_URI)
      .then(() => {
        done();
      });
  });

  it('should send a response with status code 200 and "status": "OK", "dbconnection": "mongodb+srv://admin:admin@cluster0"', function (done) {
    request(app)
      .get('/intelliq_api/admin/healthcheck')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property('status').eql('OK');
        expect(res.body).to.have.property('dbconnection').eql('mongodb+srv://admin:admin@cluster0');
        done();
      })
  });

  after(function (done) {
    mongoose.disconnect()
      .then(() => {
        done();
      });
  });
});