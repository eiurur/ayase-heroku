_        = require 'underscore-node'
request  = require 'request'
client   = require 'cheerio-httpcli'
my       = require('./my').my
save     = require './save'
s        = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")


act = (json) ->

  client.fetch json.eventURL
  , (err, $, res) ->

    if json.serviceName is 'atnd'
      my.c "--------------  ATND  -------------"
      my.c "URL", json.eventURL
      hashTag = $('.symbol-hash + a').eq(0).text()
      my.c "ハッシュタグ", hashTag

    else if json.serviceName is 'doorkeeper'
      my.c "-----------  doorkeeper  ----------"
      my.c "URL", json.eventURL
      hashTag = $('.client-main-links-others > a').eq(1).text()
      my.c "ハッシュタグ", hashTag

    # twitter用のハッシュタグが登録されていないイベントは除外
    return if _.isEmpty(hashTag) || _.isNull(hashTag)

    hashTag = hashTag.replace(/[#＃\n]/g, "")

    # 収集対象外のハッシュタグを設定しているイベントは除外
    return if my.include(s.NG_KEYWORDS, hashTag)

    # for ATND
    # なぜか終了時刻が設定されていない(=null)イベントがある。
    # その場合は開催日が終わるまでツイートの収集をし続ける(= Y:M:D 23:59:59)
    if _.isNull json.endedAt || _.isUndefined endedAt
      json.endedAt = my.endBrinkFormatYMDHms(json.startedDate)

    json.hashTag = hashTag

    save.save json

exports.scraping = (json, time) ->
  do (json, time) ->
    setTimeout (->

      # イベントのタイトルや概要にNGワードが含まれているイベントは除外
      return if my.include(s.NG_KEYWORDS, json.title)
      return if my.include(s.NG_KEYWORDS, json.description)

      act(json)

    ), time
