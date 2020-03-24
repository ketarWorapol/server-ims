const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
var accessToken = null;

const flag = 1; // เปิดครั้งแรก
let dummy;

//GET ALL USER
router.get('/', (req, res, next) => {
  var keyData = Object.keys(req.query)[0];
  var valueData = Object.values(req.query)[0];

  if (!req.query.email) {
    console.log("Tell me what you feel")
    req.query.email = "";
    // return;
  }

  var startPage = Object.values(req.query)[1] - 1;
  var limitPage = Object.values(req.query)[2];
  var skip = startPage * limitPage;
  // console.log(req.query.length)
  // console.log(startPage)

  try{
    // กรณี Search
  if ((flag == 1 && dummy == 1)) {
    const temp = User
      .find({
        [keyData]: {
          '$regex': valueData
        }
      })
      // .populate('academy')

    temp.then(items => {
        const totalItem = items.length;
        temp
          .skip(Number(skip))
          .limit(Number(limitPage))
          .then(item => {
            return res.status(200).json({
              totalItems: totalItem,
              items: item
            });
          })
      })
      .catch(err => {
        res.status(500).json({
          message: err.name
        })
      })
  } else { // กรณียังไม่ได้ Search
    dummy = 1;
    User
      .find()
      .exec()
      .then(items => {
        const totalItem = items.length;
        User
          .find()
          // .populate('academy')
          .skip(0)
          .limit(Number(limitPage))
          .then(item => {
            return res.status(200).json({
              totalItems: totalItem,
              items: item
            });
          })

      })
      .catch(err => {
        res.status(500).json({
          message: err.name
        })
      })
  }
  }catch{
    User.find()
    .then(item=>{
      return res.status(200).json({
        item
      })
    })
  }
})

//CREATE USER
router.post("/signup", (req, res, next) => {
  console.log(req.body.place)
  User.find({
      email: req.body.email
    })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "มีอีเมล์ดังกล่าวอยู่ในระบบแล้ว"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              position: req.body.position,
              image: req.body.image,
              role: req.body.role
            });
            user
              .save()
              .then(result => {
                // console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});


//Get Data BY user ID
router.get('/data', (req, res, next) => {
  jwt.verify(accessToken, process.env.JWT_KEY, function (error, decodedToken) {
    console.log(decodedToken.userId);
    const userId = decodedToken.userId;
    return User.findById({
        _id: userId
      })
      .select("position role email firstname lastname observe academy created updated image")
      .populate('academy')
      // .exec()
      .then(UserLogin => {
        return res.status(200).json(UserLogin);
      })
  })
})

router.get('/:userId', (req, res, next) => {
  const userId = req.params.userId;
  return User.findById({
      _id: userId
    })
    .populate('academy')
    .then(UserLogin => {
      return res.status(200).json(UserLogin);
    })
})

// change password 
router.patch('/change_password', (req, res, next) => {
  // req.body.old_pass = 555;

  jwt.verify(accessToken, process.env.JWT_KEY, function (error, decodedToken) {
    const userId = decodedToken.userId;
    const old_pass = req.body.old_pass;
    const new_pass = req.body.new_pass;


    User.findById({
        _id: userId
      })
      .then(user => {

        const password_in_db = user.password;
        bcrypt.compare(old_pass, password_in_db, (err, result) => {
          if (!result) {
            return res.status(401).json({
              message: "รหัสผ่านเดิมไม่ถูกต้อง"
            });
          } else
            // กรณีรหัสผ่านเก่าถูกแก้ไขรหัสผ่านได้
            bcrypt.hash(new_pass, 10, (err, hash) => {
              if (err) {
                return res.status(500).json({
                  error: err
                });
              } else {
                User.update({
                    _id: userId
                  }, {
                    password: hash
                  })
                  .exec()
                  .then(res.status(200).json({
                    message: "แก้ไขรหัสผ่านเสร็จสิ้น"
                  }));
              }
            });


        });
      })
      .catch(error => {
        return res.status(500).json({
          message: error.name,
          err: error
        })
      })
  })
})

// Update Data
router.patch("/:userId", (req, res, next) => {
  const id = req.params.userId;

  User.update({
      _id: id
    }, {
      $set: req.body
    })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "แก้ไขข้อมูลสำเร็จ",
      })
    })
    .catch(err => {
      res.status(500).json({
        message: err.name,
        message2: "WTF"
      })
    })
});

//Login
router.post("/login", (req, res, next) => {
  User.find({
      email: req.body.email
    })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "อีเมล์ หรือพาสเวิร์ดไม่ถูกต้อง"
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "อีเมล์ หรือพาสเวิร์ดไม่ถูกต้อง"
          });
        }
        if (result) {
          const token = jwt.sign({
              email: user[0].email,
              userId: user[0]._id
            },
            process.env.JWT_KEY, {
              expiresIn: "1h"
            }
          );
          accessToken = token;
          return res.status(200).json({
            message: "Auth successful",
            userId: user[0]._id,
            accessToken: token
          });
        }
        res.status(401).json({
          message: "อีเมล์ หรือพาสเวิร์ดไม่ถูกต้อง"
        });
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// Delete User
router.delete('/:userId', (req, res, next) => {
  User.remove({
      _id: req.params.userId

    })
    .exec()
    .then(result => {
      res.status(200).json({
        message: 'User is deleted'
      })
      console.log("User is deleted")
    })
    .catch(err => {
      res.status(500).json({
        message: err.name,
        error: err
      })
    })
})

module.exports = router;