const mongoose = require('mongoose');
// const product = require('./product');

const academySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    place: {
        type: String,
        required: true
    },
    etc: {
        type: String,
        required: true
    },
    subdistrict: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    province: {
        type: String,
        required: true
    },
    post_code: {
        type: String,
        required: true
    },
});

const Academy = mongoose.model('Academy', academySchema);

module.exports = Academy