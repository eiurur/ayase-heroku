_             = require 'underscore-node'
moment        = require 'moment'
request       = require 'request'
my            = require('./my').my
EventProvider = require('./model').EventProvider
s             = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")

exports.save = (json) ->

  EventProvider.countDuplicatedEvent
    serviceName: json.serviceName
    eventId: json.eventID
  , (err, num) ->
    if num is 0
      console.log json.hashTag
      console.log json.period
      EventProvider.save
        serviceName: json.serviceName
        eventId: json.eventID
        title: json.title
        description: json.description
        eventUrl: json.eventURL
        hashTag: json.hashTag
        startedDate: json.startedDate
        startedAt: json.startedAt
        endedAt: json.endedAt
        updatedAt: json.updatedAt
        period: json.period
      , (err) ->
        if err then my.dump err

        EventProvider.insertPeriod
          serviceName: json.serviceName
          eventId: json.eventID
          period: json.period
        , (err, data) ->
          # my.dump data
