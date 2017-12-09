"use strict";

const express = require('express');
const R = require('ramda');
const path = require('path');
const web = express();


const data = {
  home: {
    title: "Добро пожаловать!",
    scripts: []
  },
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
web.get('/:page?', (req, res) => {
  let page, conf;

  page = req.params.page;
  if (!page) page = 'home';
  conf = data[page];
  res.render('world', conf);
});

web.listen(8080, () => console.log('Server is up on port 8080'));
