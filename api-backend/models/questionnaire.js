const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const questionnaireSchema = new Schema({
    questionnaireID: {
        type: String,
        required: true
    },
    questionnaireTitle: {
        type: String,
        required: true
    },
    keywords: [
        { type: String, required: true }
    ],
    questions: [
        {
            qID: { type: String, required: true },
            qtext: { type: String, required: true },
            required: { type: String, required: true },
            type: { type: String, required: true },
            options: [
                {
                    optID: { type: String, required: true },
                    opttxt: { type: String, required: true },
                    nextqID: { type: String, required: true }
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Questionnaire', questionnaireSchema);