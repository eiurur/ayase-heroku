_                    = require 'underscore-node'
moment               = require 'moment'
request              = require 'request'
cronJob              = require('cron').CronJob
async                = require 'async'
s                    = require './data/lib/settings'
my                   = require './data/lib/my'
getEventFromConnpass = require('./data/lib/get-connpass').getEventFromConnpass
getTweetFromTwitter  = require('./data/lib/get-twitter').getTweetFromTwitter
serve                = require('./site/app').serve

# 猶予時間としてはこれくらいあれば十分(106件なら問題なく保存できた。)
# graceTimeConnpass = 1000 * 10
graceTimeConnpass = 1000 * 1

# これらは必要ないかも
graceTimeTwitter = 1000 * 1
graceTimeServer  = 1000 * 1


##
# 起動時のタスク
# 1.イベントデータ更新
# 2.ハッシュタグリストデータ取得
# サーバ起動
##
tasks4startUp = [

  (callback) ->

    # connpassからイベント情報を取得し、MongoDBへデータを格納
    my.c "■ Connpass task start"
    getEventFromConnpass null, "Got Event From Connpass"
    setTimeout (-> callback(null, "Done! conpass\n")), graceTimeConnpass
    return

  , (callback) ->

    # 当日開催するイベントのツイートをStreaming APIで収集する処理の開始
    my.c "■ Twitter task start"
    getTweetFromTwitter null, "Getting Tweet"
    setTimeout (-> callback(null, "Go! Twitter\n")), graceTimeTwitter
    return

  , (callback) ->

    # 閲覧用サーバーを起動
    my.c "■ Server task start"
    serve null, "Create Server"
    setTimeout (-> callback(null, "Create! Server\n")), graceTimeServer
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
# 1.イベントデータ更新
# 2.ハッシュタグリストデータ取得
##
tasks4Cron = [

  (callback) ->

    # connpassからイベント情報を取得し、MongoDBへデータを格納
    my.c "■ Connpass task start"
    getEventFromConnpass null, "Got Event From Connpass"
    setTimeout (-> callback(null, "Done! conpass\n")), graceTimeConnpass
    return

  , (callback) ->

    # 当日開催するイベントのツイートをStreaming APIで収集する処理の開始
    my.c "■ Twitter task start"
    getTweetFromTwitter null, "Getting Tweet"
    setTimeout (-> callback(null, "Go! Twitter\n")), graceTimeTwitter
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
