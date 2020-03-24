const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


mongoose.connect(
    // 'mongodb+srv://ketar:' + process.env.MONGO_ATLAS_PW + '@internship-sblpt.gcp.mongodb.net/test?retryWrites=true&w=majority', {
    'mongodb+srv://ketar:' + process.env.MONGO_ATLAS_PW + '@internship-sblpt.gcp.mongodb.net/intern?retryWrites=true&w=majority', {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
mongoose.Promise = global.Promise;

//แสดง เวลาในการ GET POST ลงใน TERMINAL ด้านล่าง
app.use(morgan('dev'));
app.unsubscribe(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
  });

//กรณีหา Route ไม่เจอ Set ERROR
app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

//Response Error
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            a: "fuck god",
            message: error.message,
        }
    });
});

module.exports = app;