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
  startedDate = my.formatYMD(json.started_at)

  # なぜか終了日時がnullのイベントがある。
  # その場合は一日の終了間際までツイートの収集を行う設定にする。
  if _.isNull json.ended_at
    json.ended_at = my.endBrinkFormatYMDHms(startedDate)

  EventProvider.countDuplicatedEvent
    serviceName: 'atnd'
    eventId: json.event_id
  , (err, num) ->
    # my.dump(json)
    if num is 0
      console.log hashTag
      EventProvider.save
        serviceName: 'atnd'
        eventId: json.event_id
        title: json.title
        description: json.description
        eventUrl: json.event_url
        hashTag: hashTag
        startedDate: startedDate
        startedAt: json.started_at
        endedAt: json.ended_at
        updatedAt: json.updated_at
      , (error, data) ->
        # my.c "イベント名", json.title
