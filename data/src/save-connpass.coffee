_             = require 'underscore-node'
moment        = require 'moment'
request       = require 'request'
s             = require './settings'
my            = require './my'
EventProvider = require('./model').EventProvider

exports.save = (json) ->

  startedDate = moment(json.started_at).format("YYYY-MM-DD")

  # 同じイベントが存在していたら … いまは何もしない。
  #
  # TODO:
  # イベントの開始時刻などが後から変更される可能性もあるので
  # それを検知してデータベース上のデータを書き換える処理が必要
  EventProvider.countDuplicatedEvent
    eventId: json.event_id
  , (err, num) ->
    if num is 0
      console.log json.hash_tag
      EventProvider.save
        eventId: json.event_id
        title: json.title
        catch: json.catch
        description: json.description
        eventUrl: json.event_url
        hashTag: json.hash_tag
        startedDate: startedDate
        startedAt: json.started_at
        endedAt: json.ended_at
        ownerId: json.owner_id
        ownerNickname: json.owner_nickname
        ownerDisplayName: json.owner_display_name
        updatedAt: json.updated_at
      , (error, data) ->
        # my.c "イベント名", json.title
        # my.c "ハッシュタグ", json.hash_tag
        # my.c "開始日", startedDate
        # my.c "開始時刻", json.started_at
        # my.c "終了時刻", json.ended_at
