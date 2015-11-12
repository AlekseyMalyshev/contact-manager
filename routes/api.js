'use strict';

let express = require('express');
let router = express.Router();

let Contact = require('../models/contact');

let checkError = (err, res, result) => {
  if (err) {
    res.status(400).send(err);
  }
  else {
    res.json(result);
  }
}

router.get('/', (req, res) => {
  Contact.read((err, contacts) => {
    checkError(err, res, contacts);
  });
});

router.post('/', (req, res) => {
  let contact = req.body;
  Contact.create(contact, (err, id) => {
    checkError(err, res, {id: id});
  });
});

router.put('/', (req, res) => {
  let contact = req.body;
  contact.id = parseInt(contact.id);
  Contact.update(contact, (err) => {
    checkError(err, res, {response: 'contact updated.'});
  });
});

router.delete('/:id', (req, res) => {
  let id = parseInt(req.params.id);
  Contact.delete(id, (err) => {
    checkError(err, res, {response: 'contact deleted.'});
  });
});

module.exports = router;
