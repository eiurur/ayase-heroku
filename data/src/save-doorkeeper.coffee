_             = require 'underscore-node'
moment        = require 'moment'
request       = require 'request'
my            = require './my'
EventProvider = require('./model').EventProvider
s             = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")

exports.save = (json, hashTag) ->

  # startsAtとendsAtはGMTなのでJSTにする場合は+9時間
  # new Date()を通すと自動でJSTに変わるため+9hする必要はない。
  startedDate = my.formatYMD(json.starts_at)

  EventProvider.countDuplicatedEvent
    serviceName: 'doorkeeper'
    eventId: json.id
  , (err, num) ->
    if num is 0
      console.log hashTag
      EventProvider.save
        serviceName: 'doorkeeper'
        eventId: json.id
        title: json.title
        description: json.description
        eventUrl: json.public_url
        hashTag: hashTag
        startedDate: startedDate
        startedAt: json.starts_at
        endedAt: json.ends_at
        updatedAt: json.updated_at
      , (error, data) ->
        # my.c "イベント名", json.title
