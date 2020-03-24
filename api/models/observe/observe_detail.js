const mongoose = require('mongoose');

const observe_detailSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    subject: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: String,
    class: String,
    observe_date: Date,
    hour: Number,
    teacher_name: String,
    questionare0: String,
    questionare1: String,
    questionare2: String,
    questionare3: String,
    questionare4: String,
    questionare5: String,
    questionare6: String,
    observeImage: String,
    // verify code 0 = undefined 1 = defined
    verify: {
        code: { type: Number, default: '0'},
        telephone: { type: String }
    }
})

const ObserveDetail = mongoose.model('observe_detail', observe_detailSchema);

module.exports = ObserveDetail;