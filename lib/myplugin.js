'use strict'

const Joi = require('joi');
const Fs = require('fs');
const Inert = require('inert');

const timeseries = require('@steve.gui/time_series');

module.exports.register = function (server, options, next) {
  function hello (request, reply) {
    reply('Hello World')
  }

  function push (request, reply) {
    reply('Hello World1')
  }

  function fetch (request, reply) {
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://localhost:27017/timeSeries", function(err, db) {
      if(!err) {
        console.log("We are connected");
        db.createCollection('timeseries', (err,collection)=>{

          timeseries.fetch(collection,(err,array)=>{
            console.log(array);
            for (var elem of array) {
                console.log(elem);
            }
            reply(array);

          })


          });
        }else{
          console.log('qui1');
        }


      });


  }

  const postPushHandler = function(request, reply) {
      console.log("rawPayload: " + request.rawPayload);
      console.log("Received POST type=" + request.payload.type + "; author=" + request.payload.author + "; content="+request.payload.content);

      var MongoClient = require('mongodb').MongoClient;

      MongoClient.connect("mongodb://localhost:27017/timeSeries", function(err, db) {
        if(!err) {
          console.log("We are connected");
          db.createCollection('timeseries', (err,collection)=>{

            timeseries.push(collection,request.payload);


            });
          }else{
            console.log('qui1');
          }


        });

      reply({
          greeting: 'POST hello to ' + request.payload.type
      });
  }

  const postPushConfig = {
      handler: postPushHandler,
      validate: {
          payload: {
              type: Joi.string().min(1).required(),
              author: Joi.string().min(1).required(),
              content: Joi.string().min(1).required()
      } }
  };


  server.route({ method: 'GET', path: '/hello', handler: hello })

  server.route({ method: 'POST', path: '/push', config: postPushConfig })

  server.route({ method: 'GET', path: '/fetch', handler: fetch })

  server.route( {method: 'GET', path: '/{param*}', handler: {
            directory: { path: './public', listing: true, index: true }
        }})

  next()
}

module.exports.register.attributes = {
  name: 'myplugin',
  version: '0.0.1'
}
