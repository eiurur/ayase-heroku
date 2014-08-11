_                    = require 'underscore-node'
moment               = require 'moment'
request              = require 'request'
aggregate            = require './aggregate'
my                   = require('./my').my
EventProvider        = require('./model').EventProvider
hashTags             = undefined
eventStartAndEndTime = undefined
s                    = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")

exports.getTweetFromTwitter = ->

  getTweet = ->

    my.dump hashTags
    my.dump eventStartAndEndTime

    s.twitter.stream "statuses/filter",
      track: hashTags
    , (stream) ->

      stream.on "data", (data) ->
        aggregate.aggregate data, eventStartAndEndTime

      stream.on "end", (response) ->

        # 切断された場合の処理
        ml.cl "end"

        # 自動で再起動
        arguments_.callee()

      stream.on "destroy", (response) ->

        # 接続が破棄された場合の処理
        ml.cl "destroy"

      return


  assingHasTags = ->

    # 年月日を取得
    nowDateYMD = moment().format("YYYY-MM-DD")

    #　パブサをかけるハッシュタグを配列に格納
    EventProvider.findByStartedDate
      startedDate: nowDateYMD
    , (err, data) ->

      # Twitter Streaming APIのtrack用(検索対象キーワード)ハッシュタグをDBから取得
      hashTags = _.map data, (num, key) ->

        # 複数タグを含んでいた場合
        # ex) jawsug chibadan awssummit aws
        # unless num.indexOf(" ") === -1
        '#'+num.hashTag

      # ハッシュタグの特定に必要なイベントデータをセット
      eventStartAndEndTime = _.map data, (num, key) ->
        period = _.findWhere num.period, startedDate: nowDateYMD
        obj =
          serviceName: num.serviceName
          eventId: num.eventId
          hashTag: '#'+num.hashTag
          startedDate: period.startedDate
          startedAt: period.startedAt
          endedAt: period.endedAt

      # イベントIDを基準として昇順に並び替え
      # 勉強会と懇談会を別のイベントとして登録した上に、同じハッシュタグを登録していた場合、
      # ツイート保存対象イベントを勉強会にするための処理。
      # これでダメなら、取得猶予時間を4時間から0に変更してしまおう。
      eventStartAndEndTime = _.sortBy eventStartAndEndTime, (o) ->
        o.eventId

      # 開催イベントが1件以上あればStreamingAPIの監視を開始する
      do getTweet unless _.isEmpty hashTags


  # Start !!
  do assingHasTags

