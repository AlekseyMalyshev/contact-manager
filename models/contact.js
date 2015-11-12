'use strict';

let fs = require('fs');

let file = 'db/contacts.json';

let contacts;

let readAll = (cb) => {
  fs.readFile(file, (err, data) => {
    if (data) {
      contacts = JSON.parse(data);
    }
    cb(err, contacts || []);
  })
}

let writeAll = (cb, data) => {
  let body = JSON.stringify(contacts);
  fs.writeFile(file, body, (err) => {
    cb(err, data);
  })
}

let createContact = (contact, cb) => {
  var id = contacts[contacts.length - 1].id + 1;
  contact.id = id;
  contacts.push(contact);
  writeAll(cb, id);
}

let createOne = (contact, cb) => {
  console.log(contact);
  if (!contacts) {
    readAll((err, contacts) => {
      if (err) {
        cb(err);
      }
      else {
        createContact(contact, cb);
      }
    });
  }
  else {
    createContact(contact, cb);
  }
}

let deleteContact = (id, cb) => {
  for (var i = 0; i < contacts.length; ++i) {
    if (contacts[i].id === id) {
      contacts.splice(i, 1);
      writeAll(cb);
      return;
    }
  }
  cb('Not Found');
}

let deleteOne = (id, cb) => {
  if (!contacts) {
    readAll((err, contacts) => {
      if (err) {
        cb(err);
      }
      else {
        deleteContact(id, cb);
      }
    });
  }
  else {
    deleteContact(id, cb);
  }
}

let updateContact = (contact, cb) => {
  for (var i = 0; i < contacts.length; ++i) {
    var record = contacts[i];
    if (record.id === contact.id) {
      for (var field in contact) {
        record[field] = contact[field];
      }
      writeAll(cb);
      return;
    }
  }
  cb('Not Found');
}

let updateOne = (contact, cb) => {
  if (!contacts) {
    readAll((err, contacts) => {
      if (err) {
        cb(err);
      }
      else {
        updateContact(contact, cb);
      }
    });
  }
  else {
    updateContact(contact, cb);
  }
}

module.exports = {
  create: createOne,
  read: readAll,
  update: updateOne,
  delete: deleteOne
}
