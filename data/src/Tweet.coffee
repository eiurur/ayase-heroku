_             = require 'underscore-node'
moment        = require 'moment'
exception     = require './exception'
my            = require './my'
model         = require './model'
EventProvider = model.EventProvider
TweetProvider = model.TweetProvider
s             = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")

## TODO
## 疑問な命名
## eventStartAndEndTime
## assign

class Tweet

  constructor: (@data, @eventStartAndEndTime) ->
    @eventData                = undefined
    @tweetTime                = undefined
    @collectionBeginningTime  = undefined
    @collectionClosingTime    = undefined

  assign: =>

    ###
    ハッシュタグが複数含まれている場合を考慮し、ループでハッシュタグの存在チェック

    MEMO: 6/10
    Twitter Straming APIは大文字小文字を区別せずに収集するため、
    イベントのハッシュタグが#swiftだと、#Swiftを含むツイートまで補足するが、
    JavaScriptでは別物とみなし、結果として undefiendが返され、そこで処理が終わる。
    ###
    @data.entities.hashtags.forEach (val) =>
      my.c "ハッシュタグ in assign", val.text

      ###
      forEachはツイートに含まれるすべてのハッシュタグをチェックするため
      「テスト投稿 #ok #ng」だと
      初めに#okと一致するイベントデータを@eventDataに代入するも、
      ループはそこで終わらず、#ngも_.findWhereで存在確認を行ってしまい、
      結果的に@eventData には Undeifnedが上書きされる。
      その回避策としてundefiendでなければループを抜け出す(continue)処理を追記
      ###
      return unless _.isUndefined @eventData
      @eventData = _.findWhere(@eventStartAndEndTime, hashTag: "#" + val.text)

  isDomesticTweet: ->
    my.c "ツイートの発生国", @data.user.lang
    my.c "if @data.user.lang is ja ", @data.user.lang is "ja"

    # user.langが"ja"なら日本国内からのツイートだと仮定
    if @data.user.lang is "ja" then true else false

  isNgUser: ->

    ###
    RTはまとめない仕様なので　@data.retweeted.user.screen_name もチェックする必要はなく
    下の処理だけでよい。
    ###
    if _.contains s.NG_USERS, @data.user.screen_name
      throw new exception.NGUserException()

  formatTweetTime: ->
    @tweetTime = my.formatYMDHms(@data.created_at)

  subHours: ->
    my.addHoursFormatYMDHms(-(s.ALLOWED_HOURS), @eventData.startedAt)

  addHours: ->
    my.addHoursFormatYMDHms(s.ALLOWED_HOURS, @eventData.endedAt)

  # デバッグ用　いつか消す？
  tweetDubug: ->
    my.c "ツイート時刻", @tweetTime
    my.c "開始時刻", @collectionBeginningTime
    my.c "終了時刻", @collectionClosingTime
    my.c "ツイート者", @data.user.screen_name
    my.c "ツイート内容", @data.text
    my.c " ↓ "

  isInTime: ->

    # その時刻が取得対象時間内かの確認を行い
    # そうであればMongoDBにツイートデータを保存する
    @collectionBeginningTime = @subHours()
    @collectionClosingTime = @addHours()

    do @tweetDubug

    my.c "\n inInTiem 時間確認 ---------------------------"
    my.c "@data.created_at = ", @data.created_at
    my.c "@tweetTime = ", @tweetTime
    my.c "\n"

    if @collectionBeginningTime <= @tweetTime <= @collectionClosingTime
      my.c "\n(≧▽≦) < 保存します！！！！！！！！！！！！！！！！！！\n"
      return true

    my.c "\n ヾ(｡>﹏<｡)ﾉﾞ✧*。 < 時間切れですー"
    return false

  check: ->
    do @restoreUrl if @isInTime()
    do @insertTweetData

  isDuplicatedTweet: ->
    my.c "middle isDuplicatedTweet"
    my.c "RT text", @data.retweeted_status.text

    # 重複ツイート(リツイート)は除外
    TweetProvider.countDuplicatedTweet
      tweetId: @data.retweeted_status.id
    , (error, num) ->
      my.c "重複したツイートです。いわゆるRT？　(๑•﹏•) < 重複の数は", num
      do @check if num is 0

  isRetweeted: ->
    if _.has(@data, 'retweeted_status') then true else false

  incrementTweetNum: ->
    EventProvider.updateTweetNum
      eventId: @eventData.eventId
    , (error) ->
      my.c "updateTweetNum!!!"

  insertTweetData: ->
    _eventId = @eventData.eventId

    # ツイートデータをハッシュタグとともにMongoDBへ保存
    TweetProvider.save
      eventId: @eventData.eventId
      tweetId: @data.id
      tweetIdStr: @data.id_str
      text: @data.text
      hashTag: @eventData.hashTag
      createdAt: @tweetTime
      userId: @data.user.id
      userName: @data.user.name
      screenName: @data.user.screen_name
      profileImageUrl: @data.user.profile_image_url
    , (error, data) =>

      ###
      ツイートの一覧をページに表示するときの手がかりがない
      -> ツイート回数が0以上なら表示ってことにしたい。
      -> それ用に、Eventsに"tweetNum"を追加
      -> tweetNumをインクリメントするための処理をここで行う
      ###
      do @incrementTweetNum

  restoreUrl: ->

    # 短縮URLを復元する。
    # t.co.~ -> http://slideshare~
    @data.entities.urls.forEach (val) =>
      @data.text = @data.text.replace val.url, val.expanded_url
      my.c "結果 in restoreUrl", @data.text
      my.c "val.url in restoreUrl", val.url
      my.c "val.expanded_url in restoreUrl", val.expanded_url

  debugInAggregate: ->
    my.c "--------------------------------------------------------------"
    my.c "今何時? -> ", moment()
    my.c "ツイートタイム -> ", @data.created_at
    my.c "--------------------------------------------------------------"
    my.c "tweet     -> ", @data.text
    my.c "hasttags  -> ", @data.hashtags
    # my.dump @data

  dump: ->
    my.dump @data


exports.Tweet = Tweet