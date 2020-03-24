const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
// const checkAuth = require('../middleware/check-auth');

// const Observer_teaching = require('../models/observe_teaching');
const User = require('../../models/user');
const Academy = require('../../models/observe/observe_teaching');
const round = 0;
//แสดงนักศึกษาทั้งหมด
router.get("/", (req, res, next) => {
    console.log("YO Mother fucker")
    User.find()
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                users: docs.map(doc => {
                    return {
                        _id: doc._id,
                        email: doc.email,
                        password: doc.password,
                        request: {
                            type: "GET",
                            url: "http://localhost:3000/observe_teaching/" + doc._id
                        }
                    }
                })
            }
            res.status(200).json(response);
        }).catch(err => {
            res.status(500).json({
                message: err.name,
                error: err
            })
        })
});

//ดูรายละเอียดการสังเกตุการสอนรายคน
router.get("/:userId", (req, res, next) => {
    const _id = req.params.userId;
    User.findById(_id)
        .select("observe.coordinator_name observe.tel observe.observe_date academy")
        .populate('academy')
        .exec()
        .then(observe => {
            if (!observe) {
                return res.status(404).json({
                    message: "Observe is not found"
                })
            }
            console.log(observe);
            res.status(200).json({
                data: observe,
                request: {
                    type: "GET",
                    url: "http://localhost:3000/observe_teaching"
                }
            })
        })
});
// สถานศึกษา

// เพิ่มสถานที่สังเกตุการสอน
router.post("/academy", (req, res, next) => {
    const observe = new Academy({
        _id: mongoose.Types.ObjectId(),
        place: req.body.place,
        etc: req.body.etc,
        subdistrict: req.body.subdistrict,
        district: req.body.district,
        province: req.body.province,
        post_code: req.body.post_code
    });

    
    // ตรวจสอบว่ามีหรือยังในระบบ
    Academy.find({
            place: observe.place
        })
        .then(result => {
            this.round = result.length;
            if (result.length != 0) {
                res.status(201).json({
                    message: "Observe is stored",
                    _id: result[0]._id,
                    place: result[0].place,
                    etc: result[0].etc,
                    subdistrict: result[0].subdistrict,
                    district: result[0].district,
                    province: result[0].province,
                    post_code: result[0].post_code,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/products/" + result._id
                    }
                });
            }
        })

    // บันทึกข้อมูล
    if (this.round == 0)
    {
        observe
            .save()
            .then(result => {
                res.status(201).json({
                    message: "Observe Academy is Created",
                    _id: result._id,
                    place: result.place,
                    etc: result.etc,
                    subdistrict: result.subdistrict,
                    district: result.district,
                    province: result.province,
                    post_code: result.post_code,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/products/" + result._id
                    }

                });
                userId = result._id;
                // console.log(userId);
            })
    }
});

//แก้ไขสถานที่ฝึกสอน
router.patch("/:observeId", (req, res, next) => {
    const id = req.params.observeId;

    console.log(req.body.academy);
    User.update({
            _id: id
        }, {

            academy: req.body.academy,
            observe: {
                coordinator_name: req.body.coordinator_name,
                tel: req.body.tel,
                observe_date: new Date(req.body.observe_date)
            }
        })
        .exec()
        .then(res.status(200).json({
            message: "เพิ่มข้อมูลสังครูพี่เลี้ยงสำเร็จ"
        }));
});

// การเพิ่มสังเกตการสอนลงใน User
router.patch("/academy/:userId", (req, res, next) => {
    const id = req.params.userId;
    const updateOps = {};

    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }

    User.update({
            _id: id
        }, {
            "intern": updateOps
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Observe Teaching is Update Completed',
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/observe_teaching/' + id
                }
            })
        }).catch(error => {
            res.status(500).json({
                message: error.name,
                error: err
            })
        })
});

router.delete("/:observeId", (req, res, next) => {
    const id = req.params.observeId;
    Observer_teaching.remove({
            _id: id
        })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Observe Teaching is deleted',
                request: {
                    type: 'POST',
                    url: 'http://locahost:3000/observe_teaching',
                    body: {
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        }).catch(err => {
            res.status(500).json({
                message: err.name,
                error: err
            })
        })
})



module.exports = router;