_          = require 'underscore-node'
moment     = require 'moment'
request    = require 'request'
client     = require 'cheerio-httpcli'
async      = require 'async'
my         = require './my'
scraping   = require './scraping'
s          = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")


# アルゴリズム
# 1.イベントデータうぃを取得
# 2.そのイベントデータのcurl
# 3.ハッシュタグを取得し(あれば、またはNGハッシュタグに登録されていなければ)
# MongoDbへ保存

# イベントURL例
# http://swtokyo.doorkeeper.jp/events/11615
# ハッシュタグ
# $('.client-main-links-others > a').eq(1).text()

# Modelにどのイベント管理サービスからなのか明記するカラム追加。
# index.jade側では、もし空白ならconnpassってことにしておく。
# ATND、connpass用モデルにも追加

formatEventData = (json) ->
  json.eventID = json.id
  json.serviceName = 'doorkeeper'
  json.eventURL = json.public_url
  json.startedDate = my.formatYMD(json.starts_at)
  json.startedAt = json.starts_at
  json.endedAt = json.ends_at
  json.updatedAt = json.updated_at
  json

exports.getEventFromDoorkeeper = ->

  INTERVAL_FOR_SCRAPING_IN_MS = 2000
  NUM_LIMIT_GET_EVENT_API     = 25
  TERM_TO_GET_TARGET_EVENT    = "3"

  page = 1
  time = 0
  isStillLeftoverNotRestoredData = true
  nowDate = my.formatYMD()
  daysAfterDate = my.addDaysFormatYMD(TERM_TO_GET_TARGET_EVENT)

  async.whilst(

    # ループ継続判定
    ->
      return isStillLeftoverNotRestoredData

    # ループ処理
    , (callback) ->

      p = my.createParams
        locale: "ja"
        since: nowDate
        until: daysAfterDate
        sort: "starts_at"

      options =
        url: "http://api.doorkeeper.jp/events?#{p}&page=#{page}"
        json: true

      request.get options, (err, res, body) ->
        return my.e "get-DK request Error", err if err

        # my.c typeof body
        my.c body.length
        my.c "page", page
        my.c "-------------------------------------------------------------"

        for json in body
          time += INTERVAL_FOR_SCRAPING_IN_MS
          jsonFormated = formatEventData(json.event)
          scraping.scraping(jsonFormated, time)

        if body.length < NUM_LIMIT_GET_EVENT_API || _.isEmpty body
          isStillLeftoverNotRestoredData = false

        page += 1

        do callback

      return

    # ループ後処理
    , (err) ->
      if err then my.e "get-DK async Error", err else my.c 'finished'
      return
  )

  return "akakak"


