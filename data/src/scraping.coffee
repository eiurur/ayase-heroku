_        = require 'underscore-node'
request  = require 'request'
client   = require 'cheerio-httpcli'
my       = require './my'
save     = require './save'
s        = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")


act = (json) ->

  # ハッシュタグを取得
  client.fetch json.eventURL
  , (err, $, res) ->

    if json.serviceName is 'atnd'
      my.c "--------------  ATND  -------------"
      hashTag = $('.symbol-hash + a').eq(0).text()
      my.c "ハッシュタグ", hashTag
      my.c "URL", json.eventURL

    else if json.serviceName is 'doorkeeper'
      my.c "-----------  doorkeeper  ----------"
      hashTag = $('.client-main-links-others > a').eq(1).text()
      my.c "ハッシュタグ", hashTag
      my.c "URL", json.eventURL

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

      # my.dump(json)

      # イベントのタイトルや概要にNGワードが含まれているイベントは除外
      return if my.include(s.NG_KEYWORDS, json.title)
      return if my.include(s.NG_KEYWORDS, json.description)

      act(json)

    ), time
