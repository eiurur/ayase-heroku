_         = require 'underscore-node'
exception = require './exception'
my        = require './my'
Tweet     = require './Tweet'


exports.aggregate = (data, eventStartAndEndTime) ->

  try
    tweet = new Tweet.Tweet(data, eventStartAndEndTime)

    # 告知botなどのツイートはまとめに含めない
    do tweet.isNgUser

    # ツイートのハッシュタグを一意に判定し、対応するイベントの開始時刻、終了時刻を割り当てる
    do tweet.assign

    do tweet.debugInAggregate

    return if _.isUndefined(tweet.eventData)

    # ツイートの時刻を "YYYY-MM-DD HH:mm:ss" に整形し、
    do tweet.formatTweetTime

    # リツイートであれば重複を確認。重複していれば、そこで処理を終了
    unless tweet.isRetweeted() then do tweet.check

    return


  catch e

    # typeof e === object
    if _.isEmpty e

      # throwした以外の予期せぬエラーはこちらで吐出する
      my.c "空"
      my.c e

    else if _.has e, "message"

      # 手動で埋め込んだエラー
      my.c e.message
      my.c e.errorHappendAt.toString()

    else
      my.dump e

