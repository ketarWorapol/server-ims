const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    position: {
        type: String,
        default: "ไม่ระบุ"
    },
    image: {
        type: String
    },
    role: {
        type: String,
        default: "1"
    },

    academy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Academy',
        // required: true
    },

    observe: [{
        coordinator_name: {
            type: String
        },
        tel: {
            type: String
        },
        observe_date: {
            type: Date
        }
    }],

    created: {
        type: Date,
        default: Date
    },
    updated: {
        type: Date,
        default: Date
    }

});



const User = mongoose.model('User', productSchema);

module.exports = User;