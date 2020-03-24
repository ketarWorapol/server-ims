// ./ root
const http =  require('http');
const express = require('express');
const app = require('./app');
var path = require('path');

const port = process.env.PORT || 5000 ;

console.log("Hello, Node.js at PORT : " + port);

const server = http.createServer(app);

// app.use(express.static(path.join(__dirname, '../dist/')));
// app.get('*',(req, res)=> {
//     res.sendFile(path.join(__dirname, 'public/index.html'))
// })

server.listen(port);