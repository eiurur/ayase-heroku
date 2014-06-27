_                    = require 'underscore-node'
moment               = require 'moment'
request              = require 'request'
my                   = require './my'
connpass             = require './save-connpass'
async                = require 'async'
connpassGetLimitNum  = 100
connpassOrderStarted = 2
s                    = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")

exports.getEventFromConnpass = ->

  async.waterfall [

    (callback) ->

      options =
        url: 'http://connpass.com/api/v1/event/?order=2'
        json: true

      request.get options, (err, res, body) ->
        return console.log err if err

        # connpass全体のイベント数からconpassAPIのリクエスト回数を求める。
        loopNum = Math.floor(body.results_available / connpassGetLimitNum)

        callback null, loopNum

    , (loopNum, callback) ->

      now = moment().format()

      for num in [0..loopNum]
        p = my.createParams
          start: num * connpassGetLimitNum
          count: connpassGetLimitNum
          order: connpassOrderStarted

        # 196件なら2回
        options =
          url: "http://connpass.com/api/v1/event/?#{p}"
          json: true

        request.get options, (err, res, body) ->
          for json in body.events

            # 終了したイベントは除外
            return if my.formatX(json.ended_at) < my.formatX(now)

            # twitter用のハッシュタグが登録されていないイベントは除外
            continue if _.isEmpty(json.hash_tag)

            # 収集対象外のハッシュタグを設定しているイベントは除外
            continue if my.include(s.NG_KEYWORDS, json.hash_tag)

            connpass.save(json)

          callback null, loopNum, "got conpass"

  ], (err, loopNum, arg2) ->
    if err
      console.error err
    else
      console.log "get-connpass done..."
      console.log loopNum + arg2

  return "sadssadsld@psl@"


