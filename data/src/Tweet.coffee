_             = require 'underscore-node'
moment        = require 'moment'
exception     = require './exception'
my            = require('./my').my
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
      # my.c "ハッシュタグ in assign", val.text

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
    my.c "ツイートの言語 ", @data.lang

    # user.langが"ja"か、ツイートが日本語であれば日本国内からのツイートだと仮定
    if @data.user.lang is "ja" or @data.lang is "ja" then true else false

  isNgTweet: ->
    ng_tweet_keyword_pattern = new RegExp "(#{s.NG_TWEET_KEYWORDS.join('|')})", 'gmi'
    if ng_tweet_keyword_pattern.test(@data.text)
      throw new exception.NGTweetException()

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
    my.c "収集開始時刻(イベント開始時刻 - "+s.ALLOWED_HOURS+")", @collectionBeginningTime
    my.c "収集終了時刻(イベント開始時刻 + "+s.ALLOWED_HOURS+")", @collectionClosingTime
    my.c "ツイート者", @data.user.screen_name
    my.c "ツイート内容", @data.text
    my.c " ↓ "

  isInTime: ->

    # その時刻が取得対象時間内かの確認を行い
    # そうであればMongoDBにツイートデータを保存する
    @collectionBeginningTime = @subHours()
    @collectionClosingTime = @addHours()

    do @tweetDubug

    if @collectionBeginningTime <= @tweetTime <= @collectionClosingTime
      my.c "\n(≧▽≦) < 保存します！！！！！！！！！！！！！！！！！！\n"
      return true

    my.c "\n ヾ(｡>﹏<｡)ﾉﾞ✧*。 < 時間切れですー"
    return false

  check: ->
    if @isInTime() then @restoreUrl() else return
    do @insertTweetData

  isDuplicatedTweet: ->
    my.c "middle isDuplicatedTweet"
    my.c "RT text", @data.retweeted_status.text

    # 重複ツイート(リツイート)は除外
    TweetProvider.countDuplicatedTweet
      serviceName: @eventData.serviceName
      tweetId: @data.retweeted_status.id
    , (error, num) ->
      my.c "重複したツイートです。いわゆるRT？　(๑•﹏•) < 重複の数は", num
      do @check if num is 0

  isRetweeted: ->
    if _.has(@data, 'retweeted_status') then true else false

  incrementTweetNum: ->
    return new Promise (resolve, reject) =>
      EventProvider.updateTweetNum
        serviceName: @eventData.serviceName
        eventId: @eventData.eventId
      , (error) ->
        return reject error if error
        my.c "updateTweetNum!!!"
        return resolve ""

  isOverNumTweet: ->
    return new Promise (resolve, reject) =>
      EventProvider.findByEventId
        serviceName: @eventData.serviceName
        eventId: @eventData.eventId
      , (error, data) =>
        return reject data[0].tweetNum unless data[0].tweetNum is 50
        my.c "n2T ===> #{@eventData.serviceName}/#{@eventData.eventId}"
        return resolve data[0]

  tweet: (event) ->
    s.twitter
    .verifyCredentials (err, data) ->
      console.log data
    .updateStatus "#{event.title} #{s.SITE_URL}/detail/#{event.serviceName}/#{event.eventId} ##{event.hashTag}", (err, data) ->
      console.log data

  notify2Twitter: ->
    @isOverNumTweet()
    .then (event) =>
      do @tweet(event)
    .catch (tweetNum) ->
      console.log "まだですー : #{tweetNum}ツイート"

  hasMediaProperty: ->
    console.log @data.entities
    _.has @data.entities, 'media'

  insertTweetData: ->
    _eventId = @eventData.eventId

    params =
      serviceName: @eventData.serviceName
      eventId: @eventData.eventId
      tweetId: @data.id
      tweetIdStr: @data.id_str
      text: @data.text
      mediaUrl: null
      displayUrl: null
      hashTag: @eventData.hashTag
      createdAt: @tweetTime
      userId: @data.user.id
      userName: @data.user.name
      screenName: @data.user.screen_name
      profileImageUrl: @data.user.profile_image_url

    if @hasMediaProperty()
      console.log 'aaa'
      params.mediaUrl = @data.entities.media[0].media_url
      params.displayUrl = @data.entities.media[0].display_url

    # ツイートデータをハッシュタグとともにMongoDBへ保存
    TweetProvider.save params, (error, data) =>
      if error
        my.c 'error insertTweetData: ', error
        return

      ###
      ツイートの一覧をページに表示するときの手がかりがない
      -> ツイート回数が0以上なら表示ってことにしたい。
      -> それ用に、Eventsに"tweetNum"を追加
      -> tweetNumをインクリメントするための処理をここで行う
      ###
      @incrementTweetNum()
      .then (data) =>
        do @notify2Twitter
      .catch (error) ->
        my.c "@incrementTweetNum error: ", error

  restoreUrl: ->

    # 短縮URLを復元する。
    # t.co.~ -> http://slideshare~
    @data.entities.urls.forEach (val) =>
      @data.text = @data.text.replace val.url, val.expanded_url
      my.c "結果 in restoreUrl", @data.text
      my.c "val.url in restoreUrl", val.url
      my.c "val.expanded_url in restoreUrl", val.expanded_url

  debugInAggregate: ->
    my.c "\n--------------------------------------------------------------"
    my.c "tweet     -> ", @data.text
    my.c "hasttags  -> ", @data.hashtags
    # my.dump @data

  dump: ->
    my.dump @data


exports.Tweet = Tweet