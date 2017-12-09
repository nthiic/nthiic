"use strict";

const express = require('express');
const path = require('path');
const web = express();


let data = {
  webWorld: {
    title: "Мир паутин",
    scripts: ["Delaunay.js", "WorldWeb.js", "worldWeb.js"]
  }
};

web.use("/scripts", express.static( path.join(__dirname, '/node_modules/ramda/dist/') ));
web.use("/scripts", express.static( path.join(__dirname, '/node_modules/phaser/dist/') ));
web.use("/scripts", express.static( path.join(__dirname, '/game/') ));
web.use("/json",    express.static( path.join(__dirname, '/json/') ));
web.use("/public",  express.static( path.join(__dirname, '/public/') ));

web.set('view engine', 'jade');
web.get('/', (req, res) => res.render('world', data.webWorld));
web.listen(8080, () => console.log('Server is up on port 8080'));
