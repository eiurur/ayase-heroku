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

  # my.c "public_url ", json.public_url

  # startsAtとendsAtはGMTなのでJSTにする場合は+9時間
  # new Date()を通すと自動でJSTに変わるため+9hする必要はない。
  startedDate = my.formatYMD(json.starts_at)

  # my.c "startedDate ", startedDate

  # 同じイベントが存在していたら … いまは何もしない。
  #
  # TODO:
  # イベントの開始時刻などが後から変更される可能性もあるので
  # それを検知してデータベース上のデータを書き換える処理が必要
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
        # my.c "ハッシュタグ", json.hash_tag
        # my.c "開始日", startedDate
        # my.c "開始時刻", json.started_at
        # my.c "終了時刻", json.ended_at
