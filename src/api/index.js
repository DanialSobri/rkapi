const app = require('express')();
require('express-ws')(app);
const express = require('express');
const config = require('../lib/config');
const routes = require('./routes');
const asyncapi = require('../lib/asyncapi');
const path = require('path');
const cors = require('cors');

const start = async () => {
  //you have access to parsed AsyncAPI document in the runtime with asyncapi.get()
  await asyncapi.init();

  app.use(routes);

  app.use((req, res, next) => {
    res.status(404).send('Error: path not found');
    next();
  });

  app.use((err, req, res, next) => {
    console.error(err);
    next();
  });

  app.listen(config.port);
  console.info(`Listening on port ${config.port}`);
};

start();
app.use(cors());
app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'pug');
// app.use(express.static(path.join(__dirname, '../../public')))
