const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const answerSchema = new Schema({
    questionnaireIDRef: {
        type: String,
        required: true
    },
    qIDRef: {
        type: String,
        required: true
    },
    ans: {
        type: String,
        required: true
    },
    session: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Answer', answerSchema);