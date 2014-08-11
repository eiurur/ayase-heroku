_                      = require 'underscore-node'
moment                 = require 'moment'
request                = require 'request'
cronJob                = require('cron').CronJob
newrelic               = require 'newrelic'
async                  = require 'async'
dir                    = './data/lib/'
my                     = require(dir + 'my').my
getEventFromConnpass   = require(dir + 'get-connpass').getEventFromConnpass
getEventFromDoorkeeper = require(dir + 'get-doorkeeper').getEventFromDoorkeeper
getEventFromATND       = require(dir + 'get-atnd').getEventFromATND
getTweetFromTwitter    = require(dir + 'get-twitter').getTweetFromTwitter
serve                  = require('./site/app').serve
s                      = if process.env.NODE_ENV is "production"
  require("./data/lib/production")
else
  require("./data/lib/development")


##
# 起動時のタスク
# 1.サーバ起動
# 2.Connpassのイベントデータ更新
# 3.Doorkeeperのイベントデータ更新
# 4.ハッシュタグリストデータ取得
##
tasks4startUp = [

  (callback) ->

    # 閲覧用サーバーを起動 (最初に(60秒以内に)サーバーを立ち上げないとherokuから怒られる)
    my.c "■ Server task start"
    serve null, "Create Server"
    setTimeout (-> callback(null, "Create! Server\n")), s.GRACE_TIME_SERVER
    return

  , (callback) ->

    # connpassからイベント情報を取得し、MongoDBへデータを格納
    my.c "■ Connpass task start"
    getEventFromConnpass null, "Got Event From Connpass"
    setTimeout (-> callback(null, "Done! conpass\n")), s.GRACE_TIME_CONNPASS
    return

  (callback) ->

    # Doorkeeperからイベント情報を取得し、MongoDBへデータを格納
    my.c "■ Doorkeeper task start"
    getEventFromDoorkeeper null, "Got Event From Doorkeeper"
    setTimeout (-> callback(null, "Done! Doorkeeper\n")), s.GRACE_TIME_DK
    return

  (callback) ->

    # ATNDからイベント情報を取得し、MongoDBへデータを格納
    my.c "■ ATND task start"
    getEventFromATND null, "Got Event From ATND"
    setTimeout (-> callback(null, "Done! ATND\n")), s.GRACE_TIME_ATND
    return

  , (callback) ->

    # 当日開催するイベントのツイートをStreaming APIで収集する処理の開始
    my.c "■ Twitter task start"
    getTweetFromTwitter null, "Getting Tweet"
    setTimeout (-> callback(null, "Go! Twitter\n")), s.GRACE_TIME_TWITTER
    return
]

async.series tasks4startUp, (err, results) ->
  if err
    console.error err
  else
    console.log  "\nall done... Start!!!!\n"
  return


##
# 日付変更時のタスク
# 1.Connpassのイベントデータ更新
# 2.Doorkeeperのイベントデータ更新
# 3.ハッシュタグリストデータ取得
##
tasks4Cron = [

  (callback) ->

    # connpassからイベント情報を取得し、MongoDBへデータを格納
    my.c "■ Connpass task start"
    getEventFromConnpass null, "Got Event From Connpass"
    setTimeout (-> callback(null, "Done! conpass\n")), s.GRACE_TIME_CONNPASS
    return

  (callback) ->

    # Doorkeeperからイベント情報を取得し、MongoDBへデータを格納
    my.c "■ Doorkeeper task start"
    getEventFromDoorkeeper null, "Got Event From Doorkeeper"
    setTimeout (-> callback(null, "Done! Doorkeeper\n")), s.GRACE_TIME_DK
    return

  (callback) ->

    # ATNDからイベント情報を取得し、MongoDBへデータを格納
    my.c "■ ATND task start"
    getEventFromATND null, "Got Event From ATND"
    setTimeout (-> callback(null, "Done! ATND\n")), s.GRACE_TIME_ATND
    return

  , (callback) ->

    # 当日開催するイベントのツイートをStreaming APIで収集する処理の開始
    my.c "■ Twitter task start"
    getTweetFromTwitter null, "Getting Tweet"
    setTimeout (-> callback(null, "Go! Twitter\n")), s.GRACE_TIME_TWITTER
    return

]

cronTime = "0 0 * * *"

job = new cronJob(
  cronTime: cronTime
  onTick: ->
    async.series tasks4Cron, (err, results) ->
      if err
        console.error err
      else
        console.log  "\nhashtag list to pick up and registered event data was renewed.\n"
      return
    return

  onComplete: ->
    console.log "tasks4Cron Completed...."
    return

  start: true

  timeZone: "Japan/Tokyo"
)
