_               = require 'underscore-node'
moment          = require 'moment'
request         = require 'request'
client          = require 'cheerio-httpcli'
my              = require './my'
saveDK = require './save-doorkeeper'
EventProvider   = require('./model').EventProvider
s               = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")


act = (json) ->

  # my.c "---------- ここからスクレイピング + DBへの保存処理 ------------"
  # my.c "params.public_url ", params.public_url

  # ハッシュタグを取得
  client.fetch json.public_url
  , (err, $, res) ->

    console.log $("title").text()

    hashTag = $('.client-main-links-others > a').eq(1).text()
    # my.c "元のハッシュタグ typeof", typeof hashTag

    # twitter用のハッシュタグが登録されていないイベントは除外
    return if _.isEmpty(hashTag)

    hashTag = hashTag.replace(/[#＃\n]/g, "")
    my.c "--------------------------------"
    my.c "置換後のハッシュタグ", hashTag

    # 収集対象外のハッシュタグを設定しているイベントは除外
    return if my.include(s.NG_KEYWORDS, hashTag)

    saveDK.save(json, hashTag)


exports.scraping = (json, time) ->
  do (json, time) ->
    setTimeout (->

      now = my.formatX()

      # イベントのタイトルや概要にNGワードが含まれているイベントは除外
      return if my.include(s.NG_KEYWORDS, json.event.title)
      return if my.include(s.NG_KEYWORDS, json.event.description)

      act(json.event)

    ), time
