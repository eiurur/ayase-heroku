_                           = require 'underscore-node'
moment                      = require 'moment'
request                     = require 'request'
my                          = require './my'
scrapingATND 　　　　　　　　　　　　　= require './scraping-atnd'
async                       = require 'async'
INTERVAL_FOR_SCRAPING_IN_MS = 2000
NUM_LIMIT_GET_EVENT_API     = 100
s                  = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")


exports.getEventFromATND = ->

  page = 0
  time = 0
  ymds = my.getDaysYYYYMMDD(3)
  isStillLeftoverNotRestoredData = true

  async.whilst(

    # ループ継続判定
    ->
      return isStillLeftoverNotRestoredData

    # ループ処理
    , (callback) ->

      termSearcheEvent = _.reduce ymds, (memo, ymd) ->
        memo + ',' + ymd

      p = my.createParams
        ymd: termSearcheEvent
        start: page * NUM_LIMIT_GET_EVENT_API + 1
        count: NUM_LIMIT_GET_EVENT_API
        format: "json"

      options =
        url: "http://api.atnd.org/events/?#{p}"

      request.get options, (err, res, body) ->
        return my.e "get-ATND request Error", err if err

        # APIの返り値が文字列なのでオブジェクトに変換する
        body = JSON.parse(body)

        for json in body.events
          time += INTERVAL_FOR_SCRAPING_IN_MS
          scrapingATND.scraping(json.event, time)

        eventNum = body.results_returned
        if eventNum  < NUM_LIMIT_GET_EVENT_API || _.isEmpty body.events
          isStillLeftoverNotRestoredData = false

        page += 1

        do callback

      return

    # ループ後処理
    , (err) ->
      if err then my.e "get-ATND async Error", err else my.c 'finished'
      return
  )

  return "ATND"