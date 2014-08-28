_             = require 'underscore-node'
moment        = require 'moment'
my            = require('./my').my
EventProvider = require('./model').EventProvider
s             = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")

exports.clearEventData = ->

  # ツイート数が9つ以下かつ、1週間前のイベントを削除する。

  date = my.addDaysFormatYMDHms '-7'

  EventProvider.clear
    date: date
  , (err) ->
    if err then my.dump err


exports.clearTweetData = ->

  # ツイート数が9つ以下かつ、1週間前のイベントに関するツイートを削除する。

  date = my.addDaysFormatYMDHms '-7'

  TweetProvider.clear
    date: date
  , (err) ->
    if err then my.dump err


