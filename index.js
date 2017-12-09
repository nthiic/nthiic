"use strict";

const express = require('express');
const path = require('path');
const web = express();


let data = {
  worldName: "Мир паутин"
};

web.use("/scripts", express.static( path.join(__dirname, '/node_modules/ramda/dist/') ));
web.use("/scripts", express.static( path.join(__dirname, '/node_modules/phaser/dist/') ));
web.use("/scripts", express.static( path.join(__dirname, '/game/') ));
web.use("/json",    express.static( path.join(__dirname, '/tools/') ));
web.use("/public",  express.static( path.join(__dirname, '/public/') ));

web.set('view engine', 'jade');
web.get('/', (req, res) => res.render('world', data));
web.listen(8000, () => console.log('Server is up on port 8000'));
