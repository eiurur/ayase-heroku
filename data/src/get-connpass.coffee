_                       = require 'underscore-node'
moment                  = require 'moment'
request                 = require 'request'
my                      = require('./my').my
save                    = require './save'
async                   = require 'async'
CONNPASS_GET_LIMIT_NUM  = 100
CONNPASS_ORDER_STARTED  = 2
s                       = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")

formatEventData = (json, period) ->
  json.eventID = json.event_id
  json.serviceName = 'connpass'
  json.eventURL = json.event_url
  json.hashTag = json.hash_tag
  json.startedDate = my.formatYMD(json.started_at)
  json.startedAt = json.started_at
  json.endedAt = json.ended_at
  json.updatedAt = json.updated_at
  json.period = period
  json

exports.getEventFromConnpass = ->

  tasks = [

    (callback) ->

      options =
        url: 'http://connpass.com/api/v1/event/?order=2'
        json: true

      request.get options, (err, res, body) ->
        return console.log err if err

        # connpass全体のイベント数からconpassAPIのリクエスト回数を求める。
        loopNum = Math.floor(body.results_available / CONNPASS_GET_LIMIT_NUM)

        callback null, loopNum

      return

    , (loopNum, callback) ->

      now = my.formatX()

      for num in [0..loopNum]
        p = my.createParams
          start: num * CONNPASS_GET_LIMIT_NUM
          count: CONNPASS_GET_LIMIT_NUM
          order: CONNPASS_ORDER_STARTED

        # 196件なら2回
        options =
          url: "http://connpass.com/api/v1/event/?#{p}"
          json: true

        request.get options, (err, res, body) ->
          for json in body.events

            # 終了したイベントは除外
            return if my.formatX(json.started_at) < now

            # twitter用のハッシュタグが登録されていないイベントは除外
            continue if _.isEmpty(json.hash_tag)

            # 収集対象外のハッシュタグを設定しているイベントは除外
            continue if my.include(s.NG_KEYWORDS, json.hash_tag)

            period = my.getPeriod json.started_at, json.ended_at
            jsonFormated = formatEventData(json, period)
            save.save(jsonFormated)

          callback null, loopNum, "got conpass"

      return

  ]

  async.waterfall tasks, (err, loopNum, arg2) ->
    if err
      console.error err
    else
      console.log "get-connpass done..."
      console.log loopNum + arg2

  return "sadssadsld@psl@"


