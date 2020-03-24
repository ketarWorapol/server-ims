const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const user = require('../../models/user');
const observe_detail = require('../../models/observe/observe_detail');

// verify by telephone
const Nexmo = require('nexmo');

var REQUEST_ID;

const nexmo = new Nexmo({
  apiKey: '7af79f82',
  apiSecret: 'AbR91cLUnexMq3Dx',
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/img/');
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};


const upload = multer({
    dest: 'uploads/img/',
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get("/", (req, res, next) => {
    res.status(201).json({
        message: "WTF"
    })
});

// หารายละเอียดการสังเกตการสอน
router.get("/:userId", (req, res, next) => {
    const userId = req.params.userId;
    observe_detail.find({
            user: userId
        })
        // .populate('user','firstname lastname')
        .sort({
            observe_date: -1
        })
        .then(item => {
            const totalItem = item.length;
            let totalHour = 0;

            // หาจำนวนชั่วโมงที่สังเกตการสอน
            for (let i = 0; i < totalItem; i++) {
                totalHour += item[i].hour;
            }

            res.status(200).json({
                totalItems: totalItem,
                totalHour: totalHour,
                items: item
            });
        }).catch(err => {
            res.status(500).json({
                message: err.name,
                error: err
            })
        })
});

//ส่ง verify code
router.post("/verify", (req, res, next)=> {
    const otp_telephone = req.body.otp_telephone;
    var convert_telephone;
    
    if(otp_telephone.charAt(0)=="0"){
        convert_telephone = "66" + otp_telephone.substr(1);
    }

    nexmo.verify.request({
    number: convert_telephone,
    brand: 'KMUTNB',
    code_length: '4'
    }, (err, result) => {
        if(err){
            console.error(err);
        }else{
            REQUEST_ID = result.request_id;
            console.log("Send verify => " + REQUEST_ID);
        }
    });
})


// เพิ่มรายละเอียดการสังเกตการสอน
router.post("/", (req, res, next) => {
    console.log(req.file);
    console.log("=====");
    console.log(req.body);
    // กรณีมีรูป
    if(!req.file){
        const detail = new observe_detail({
            _id: mongoose.Types.ObjectId(),
            subject: req.body.subject,
            title: req.body.title,
            observe_date: req.body.observe_date,
            teacher_name: req.body.teacher_name,
            hour: req.body.hour,
            class: req.body.class,
            questionare0: req.body.questionare0,
            questionare1: req.body.questionare1,
            questionare2: req.body.questionare2,
            questionare3: req.body.questionare3,
            questionare4: req.body.questionare4,
            questionare5: req.body.questionare5,
            questionare6: req.body.questionare6,
            observeImage: req.body.observeImage,
            user: req.body.user,
        })

        detail
        .save()
        .then(result => {
            res.status(201).json({
                message: "observe_detail is created",
                _id: result._id,
                suject: result.subject,
                title: result.title,
                class: result.class,
                observe_date: result.observe_date,
                hour: result.hour,
                teacher_name: result.teacher_name,
                user: result.user,
                questionare0: result.questionare0,
                questionare1: result.questionare1,
                questionare2: result.questionare2,
                questionare3: result.questionare3,
                questionare4: result.questionare4,
                questionare5: result.questionare5,
                questionare6: result.questionare6,
                observeImage: result.observeImage,
            })

        })
        .catch(err => {
            res.status(500).json({
                message: err.name,
                error: err
            })
        })
    }else{
        const filename = new Date().toISOString() + req.file.originalname
        const detail = new observe_detail({
            _id: mongoose.Types.ObjectId(),
            subject: req.body.subject,
            title: req.body.title,
            observe_date: req.body.observe_date,
            teacher_name: req.body.teacher_name,
            hour: req.body.hour,
            class: req.body.class,
            questionare0: req.body.questionare0,
            questionare1: req.body.questionare1,
            questionare2: req.body.questionare2,
            questionare3: req.body.questionare3,
            questionare4: req.body.questionare4,
            questionare5: req.body.questionare5,
            questionare6: req.body.questionare6,
            user: req.body.user,
            observeImage: filename
        })

        detail
        .save()
        .then(result => {
            res.status(201).json({
                message: "observe_detail is created",
                _id: result._id,
                suject: result.subject,
                title: result.title,
                class: result.class,
                observe_date: result.observe_date,
                hour: result.hour,
                teacher_name: result.teacher_name,
                user: result.user,
                questionare0: result.questionare0,
                questionare1: result.questionare1,
                questionare2: result.questionare2,
                questionare3: result.questionare3,
                questionare4: result.questionare4,
                questionare5: result.questionare5,
                questionare6: result.questionare6,
                observeImage: result.observeImage,
            })

        })
        .catch(err => {
            res.status(500).json({
                message: err.name,
                error: err
            })
        })
    }    
})

router.patch("/update_verify/:_id", (req, res, next) => {
    const _id = req.params._id;
    // code ที่ส่งไปยังโทรศัพท์
    const code = req.body.code;
    const telephone = req.body.telephone;
    console.log("Kaido");
    console.log(_id);

    // หากไม่ถูกต้องจะ Error
    nexmo.verify.check({
        request_id: REQUEST_ID,
        code: code
        }, (err, result) => {
        console.log(err ? err : result)

    });

    observe_detail.update({
            _id: _id
        }, {
            verify :{
                code : 1,
                telephone: telephone
            }
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Observe Detail is Updated"
            })
        });
})

// แก้ไขรายละเอียดการสังเกตการสอน
router.patch("/:_id", (req, res, next) => {
    const id = req.params._id;

    console.log(id)

    observe_detail.update({
            _id: id
        }, {
            subject: req.body.subject,
            title: req.body.title,
            class: req.body.class,
            observe_date: req.body.observe_date,
            hour: req.body.hour,
            teacher_name: req.body.teacher_name,
            user: req.body.userId,
            questionare0: req.body.questionare0,
            questionare1: req.body.questionare1,
            questionare2: req.body.questionare2,
            questionare3: req.body.questionare3,
            questionare4: req.body.questionare4,
            questionare5: req.body.questionare5,
            questionare6: req.body.questionare6
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Observe Detail is Updated"
            })
        });
})

// ลบรายละเอียดการสังเกตการสอน
router.delete("/:_id", (req, res, next) => {
    const _id = req.params._id;
    observe_detail.remove({
            _id: _id
        })
        .exec()
        .then(
            res.status(200).json({
                message: 'Observe Detail is deleted'
            })
        )
})

module.exports = router;