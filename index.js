"use strict";

const express = require('express');
const R = require('ramda');
const path = require('path');
const web = express();
const data = { page: 'Just another game' };

web.use(express.static(path.join(__dirname, 'public')));
web.get('/', (rq, rs) => rs.render("index.html", data));
web.listen(8080, () => console.log("Server is up on port 8080"));
