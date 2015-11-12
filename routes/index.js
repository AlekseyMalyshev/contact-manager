'use strict';

let express = require('express');
let router = express.Router();

let Contact = require('../models/contact');

router.get('/', (req, res) => {
  Contact.read((err, contacts) => {
    if (!err) {
      res.render('index', {contacts: contacts});
    }
    else {
      res.send('');
    }
  });
});

module.exports = router;
