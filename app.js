(function() {
  var async, cronJob, cronTime, getEventFromConnpass, getTweetFromTwitter, graceTimeConnpass, graceTimeServer, graceTimeTwitter, job, moment, my, request, s, serve, tasks4Cron, tasks4startUp, _;

  _ = require('underscore-node');

  moment = require('moment');

  request = require('request');

  cronJob = require('cron').CronJob;

  async = require('async');

  s = require('./data/lib/settings');

  my = require('./data/lib/my');

  getEventFromConnpass = require('./data/lib/get-connpass').getEventFromConnpass;

  getTweetFromTwitter = require('./data/lib/get-twitter').getTweetFromTwitter;

  serve = require('./site/app').serve;

  graceTimeConnpass = 1000 * 1;

  graceTimeTwitter = 1000 * 1;

  graceTimeServer = 1000 * 1;

  tasks4startUp = [
    function(callback) {
      my.c("■ Connpass task start");
      getEventFromConnpass(null, "Got Event From Connpass");
      setTimeout((function() {
        return callback(null, "Done! conpass\n");
      }), graceTimeConnpass);
    }, function(callback) {
      my.c("■ Twitter task start");
      getTweetFromTwitter(null, "Getting Tweet");
      setTimeout((function() {
        return callback(null, "Go! Twitter\n");
      }), graceTimeTwitter);
    }, function(callback) {
      my.c("■ Server task start");
      serve(null, "Create Server");
      setTimeout((function() {
        return callback(null, "Create! Server\n");
      }), graceTimeServer);
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
      }), graceTimeConnpass);
    }, function(callback) {
      my.c("■ Twitter task start");
      getTweetFromTwitter(null, "Getting Tweet");
      setTimeout((function() {
        return callback(null, "Go! Twitter\n");
      }), graceTimeTwitter);
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
    timeZone: "Japan/Tokyo"
  });

}).call(this);
