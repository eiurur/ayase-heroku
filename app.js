(function() {
  var async, clearEventData, cronJob, cronTime, dir, getEventFromATND, getEventFromConnpass, getEventFromDoorkeeper, getTweetFromTwitter, job, moment, my, newrelic, request, s, serve, tasks4Cron, tasks4startUp, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  cronJob = require('cron').CronJob;

  newrelic = require('newrelic');

  async = require('async');

  dir = './data/lib/';

  my = require(dir + 'my').my;

  getEventFromConnpass = require(dir + 'get-connpass').getEventFromConnpass;

  getEventFromDoorkeeper = require(dir + 'get-doorkeeper').getEventFromDoorkeeper;

  getEventFromATND = require(dir + 'get-atnd').getEventFromATND;

  getTweetFromTwitter = require(dir + 'get-twitter').getTweetFromTwitter;

  clearEventData = require(dir + 'clear').clearEventData;

  serve = require('./site/app').serve;

  s = process.env.NODE_ENV === "production" ? require("./data/lib/production") : require("./data/lib/development");

  tasks4startUp = [
    function(callback) {
      my.c("■ Server task start");
      serve(null, "Create Server");
      setTimeout((function() {
        return callback(null, "Create! Server\n");
      }), s.GRACE_TIME_SERVER);
    }, function(callback) {
      my.c("■ Connpass task start");
      getEventFromConnpass(null, "Got Event From Connpass");
      setTimeout((function() {
        return callback(null, "Done! conpass\n");
      }), s.GRACE_TIME_CONNPASS);
    }, function(callback) {
      my.c("■ Doorkeeper task start");
      getEventFromDoorkeeper(null, "Got Event From Doorkeeper");
      setTimeout((function() {
        return callback(null, "Done! Doorkeeper\n");
      }), s.GRACE_TIME_DK);
    }, function(callback) {
      my.c("■ ATND task start");
      getEventFromATND(null, "Got Event From ATND");
      setTimeout((function() {
        return callback(null, "Done! ATND\n");
      }), s.GRACE_TIME_ATND);
    }, function(callback) {
      my.c("■ Twitter task start");
      getTweetFromTwitter(null, "Getting Tweet");
      setTimeout((function() {
        return callback(null, "Go! Twitter\n");
      }), s.GRACE_TIME_TWITTER);
    }, function(callback) {
      my.c("■ Event Data Clear Task start");
      clearEventData(null, "Clearrrrrrrrrrrrrrrr ");
      setTimeout((function() {
        return callback(null, "Event Data CLEAR \n");
      }), s.GRACE_TIME_CLEAR);
    }
  ];

  async.series(tasks4startUp, function(err, results) {
    if (err) {
      console.error(err);
    } else {
      console.log("\nall done... Start!!!!\n");
    }
  });

  tasks4Cron = [
    function(callback) {
      my.c("■ Connpass task start");
      getEventFromConnpass(null, "Got Event From Connpass");
      setTimeout((function() {
        return callback(null, "Done! conpass\n");
      }), s.GRACE_TIME_CONNPASS);
    }, function(callback) {
      my.c("■ Doorkeeper task start");
      getEventFromDoorkeeper(null, "Got Event From Doorkeeper");
      setTimeout((function() {
        return callback(null, "Done! Doorkeeper\n");
      }), s.GRACE_TIME_DK);
    }, function(callback) {
      my.c("■ ATND task start");
      getEventFromATND(null, "Got Event From ATND");
      setTimeout((function() {
        return callback(null, "Done! ATND\n");
      }), s.GRACE_TIME_ATND);
    }, function(callback) {
      my.c("■ Twitter task start");
      getTweetFromTwitter(null, "Getting Tweet");
      setTimeout((function() {
        return callback(null, "Go! Twitter\n");
      }), s.GRACE_TIME_TWITTER);
    }, function(callback) {
      my.c("■ Event Data Clear Task start");
      clearEventData(null, "Clearrrrrrrrrrrrrrrr ");
      setTimeout((function() {
        return callback(null, "Event Data CLEAR \n");
      }), s.GRACE_TIME_CLEAR);
    }
  ];

  cronTime = "0 0 * * *";

  job = new cronJob({
    cronTime: cronTime,
    onTick: function() {
      async.series(tasks4Cron, function(err, results) {
        if (err) {
          console.error(err);
        } else {
          console.log("\nhashtag list to pick up and registered event data was renewed.\n");
        }
      });
    },
    onComplete: function() {
      console.log("tasks4Cron Completed....");
    },
    start: true,
    timeZone: "Asia/Tokyo"
  });

}).call(this);
