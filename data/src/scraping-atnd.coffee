_        = require 'underscore-node'
request  = require 'request'
client   = require 'cheerio-httpcli'
my       = require './my'
saveATND = require './save-atnd'
s        = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")


act = (json) ->

  # ハッシュタグを取得
  client.fetch json.event_url
  , (err, $, res) ->

    # 日本語が文字化けする
    # hashTag = $('.symbol-hash + a').html()
    hashTag = $('.symbol-hash + a').eq(0).text()

    # twitter用のハッシュタグが登録されていないイベントは除外
    return if _.isEmpty(hashTag) || _.isNull(hashTag)

    hashTag = hashTag.replace(/[#＃\n]/g, "")

    my.c "--------------  ATND  -------------"
    my.c $("title").text()
    my.c "url", json.event_url
    my.c "置換後のハッシュタグ", hashTag

    # 収集対象外のハッシュタグを設定しているイベントは除外
    return if my.include(s.NG_KEYWORDS, hashTag)

    saveATND.save(json, hashTag)


exports.scraping = (json, time) ->
  do (json, time) ->
    setTimeout (->

      # my.dump(json)

      # イベントのタイトルや概要にNGワードが含まれているイベントは除外
      return if my.include(s.NG_KEYWORDS, json.title)
      return if my.include(s.NG_KEYWORDS, json.description)

      act(json)

    ), time
