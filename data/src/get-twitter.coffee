_                    = require 'underscore-node'
moment               = require 'moment'
request              = require 'request'
aggregate            = require './aggregate'
s                    = require './settings'
my                   = require './my'
EventProvider        = require('./model').EventProvider
hashTags             = undefined
eventStartAndEndTime = undefined


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
        '#'+num.hashTag

      # ハッシュタグの特定に必要なConnpassのイベントデータをセット
      eventStartAndEndTime = _.map data, (num, key) ->
        obj =
          eventId: num.eventId
          hashTag: '#'+num.hashTag
          startedDate: num.startedDate
          startedAt: num.startedAt
          endedAt: num.endedAt

      # 開催イベントが1件以上あればStreamingAPIの監視を開始する
      do getTweet unless _.isEmpty hashTags


  # Start !!
  do assingHasTags

