
'use strict';

let express = require('express');
let morgan = require('morgan');
let bodyParser = require('body-parser');

let api = require('./routes/api');
let contacts = require('./routes/contacts');
let edit = require('./routes/edit');
let index = require('./routes/index');

let app = express();

app.set('view engine', 'jade');
app.use(express.static('public'));
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/api', api);
app.use('/', index);
app.use('/contacts', contacts);
app.use('/edit', edit);

let port = process.env.PORT || 3000;
let listener = app.listen(port);

console.log('express in listening on port: ' + listener.address().port);
