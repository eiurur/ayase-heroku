mongoose = require 'mongoose'
uri      = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1/app26755501'
db       = mongoose.connect uri
Schema   = mongoose.Schema
ObjectId = Schema.ObjectId


##
# Schemaインタフェースを通してモデルの定義を行う
##
SeriesSchema = new Schema
  id: Number
  title: String
  url: String

EventSchema = new Schema
  serviceName:
    type: String
    default: 'connpass'
  eventId: Number
  title: String
  catch: String
  description: String
  eventUrl: String
  hashTag: String
  startedDate: Date
  startedAt: Date
  endedAt: Date
  series: [SeriesSchema]
  ownerId: String
  ownerNickname: String
  ownerDisplayName: String
  updatedAt: Date
  publicUrl:
    type: String
    default: ''
  tweetNum:
    type: Number
    default: 0
  period:
    type: Array
    default: []

TweetSchema = new Schema
  serviceName:
    type: String
    default: 'connpass'
  eventId: Number
  tweetId: Number
  tweetIdStr: String
  text: String
  mediaUrl: String
  displayUrl: String
  hashTag: String
  createdAt: Date
  userId: String
  userName: String
  screenName: String
  profileImageUrl: String

SlideSchema = new Schema
  tweet:
    type: Schema.Types.ObjectId
    ref : 'Tweet'
  url: String


# Indexes
EventSchema.index eventId: -1
TweetSchema.index eventId: -1

##
# モデルへのアクセス
# mongoose.model 'モデル名', 定義したスキーマクラス
# を通して一度モデルを定義すると、同じ関数を通してアクセスすることができます
##
mongoose.model 'Event', EventSchema
mongoose.model 'Tweet', TweetSchema
mongoose.model 'Slide', SlideSchema


##
# 定義した時の登録名で呼び出し
##
Event = mongoose.model 'Event'
Tweet = mongoose.model 'Tweet'
Slide = mongoose.model 'Slide'


##
# クラスの生成
##
class EventProvider

  findAll: (params, callback) ->
    console.log "------------------ find all --------------------"

    Event.find tweetNum: {$gt: 0}
         .sort startedAt: -1
         .exec (err, data) ->
           callback err, data

  findOnTheDay: (params, callback) ->
    console.log "------------- find findOnTheDay ----------------"

    Event.find "$or": [
          'period.startedDate': params['nowDate']
          'startedDate': params['nowDate']
         ]
         .sort startedAt: -1
         .limit params["numShow"]
         .exec (err, data) ->
           callback err, data

  findInit: (params, callback) ->
    console.log "----- find init tweet greater than equal 10 -----"

    Event.find tweetNum: {$gt: 0}
         # .sort tweetNum: -1
         .sort startedAt: -1
         .limit params["numShow"]
         .exec (err, data) ->
           callback err, data

  findRest: (params, callback) ->
    console.log "----- find rest tweet greater than 0 -----"

    Event.find tweetNum: {$gt: 0}
         .sort startedAt: -1
         .skip params["numSkip"]
         .exec (err, data) ->
           callback err, data

  findMore: (params, callback) ->
    console.log "----- find More tweet greater than 0 -----"

    Event.find tweetNum: {$gt: 0}
         .sort startedAt: -1
         .limit 10
         .skip params.numSkip * 10
         .exec (err, data) ->
           callback err, data

  findByEventId: (params, callback) ->
    console.log "-------------------- find ----------------------"

    Event.find "$and": [
          serviceName: params['serviceName']
          eventId: params['eventId']
         ]
         .limit params["numShow"] || 0
         .exec (err, data) ->
           callback err, data

  findByStartedDate: (params, callback) ->
    console.log "----------------- find Date --------------------"

    Event.find 'period.startedDate': params['startedDate']
         .sort startedAt: -1
         .exec (err, data) ->
           callback err, data

  countDuplicatedEvent: (params, callback) ->
    Event.find "$and": [
          serviceName: params['serviceName']
          eventId: params['eventId']
         ]
         .count()
         .exec (err, num) ->
           callback(err, num)

  insertPeriod: (params, callback) ->
    console.log '-------------- insert period ---------------'
    # console.log params
    Event.update
      serviceName: params['serviceName']
      eventId: params['eventId']
    ,
      $set:
        period: params['period']
    , (err) ->
      callback(err, params)


  save: (params, callback) ->
    console.log "-------------------- save ----------------------"

    event = new Event
      serviceName: params['serviceName']
      eventId: params['eventId']
      title: params['title']
      description: params['description']
      eventUrl: params['eventUrl']
      hashTag: params['hashTag']
      startedDate: params['startedDate']
      startedAt: params['startedAt']
      endedAt: params['endedAt']
      updatedAt: params['updatedAt']
    event.save (err) ->
      callback(err, params)

  updateTweetNum: (params, callback) ->
    Event.update
      "$and": [
        serviceName: params['serviceName']
        eventId: params['eventId']
       ]
    ,
      $inc: tweetNum: 1
    , (err) ->
      callback()

  removeByEventId: (params, callback) ->
    console.log "remove"

    Event.remove {eventId: params['eventId']}, (err, data) ->
      callback err, data

  # 終了日時から1週間経過 + ツイート数が10未満のイベントは削除
  clear: (params, callback) ->
    console.log "\nClearrrrrrrrrrrrrrrrrrrr!!!!!\n"

    Event.remove
      "$and": [
        endedAt: {$lt: params['date']}
        tweetNum: {$lt: 10}
       ]
    , (err) ->
      callback null


class TweetProvider

  findInitByEventId: (params, callback) ->
    Tweet.find "$and": [
          serviceName: params['serviceName']
          eventId: params['eventId']
         ]
         .sort tweetId: 1
         .limit params["numShow"]
         .exec (err, data) ->
           callback err, data

  findRestByEventId: (params, callback) ->
    Tweet.find "$and": [
          serviceName: params['serviceName']
          eventId: params['eventId']
         ]
         .sort tweetId: 1
         .skip params["numSkip"] || 0
         .exec (err, data) ->
           callback err, data


  findNewByEventId: (params, callback) ->
    Tweet.find "$and": [
          serviceName: params['serviceName']
          eventId: params['eventId']
          tweetIdStr:
            $gt: params['tweetIdStr'] + ''
         ]
         .sort tweetId: 1
         .exec (err, data) ->
           callback err, data

  findByEventId: (params, callback) ->
    Tweet.find eventId: params['eventId'], (err, data) ->
      callback err, data

  findByTweetId: (params, callback) ->
    Tweet.find tweetId: params['tweetId'], (err, data) ->
      callback err, data

  findByHashTag: (params, callback) ->
    Tweet.find hashTag: params['hashTag'], (err, data) ->
      callback err, data

  countDuplicatedTweet: (params, callback) ->
    Tweet.find "$and": [
          serviceName: params['serviceName']
          eventId: params['eventId']
         ]
         .count()
         .exec (err, num) ->
           callback(err, num)

  save: (params, callback) ->
    console.log "Twitter Go ----> MongoDB"
    tweet = new Tweet
      serviceName: params['serviceName']
      eventId: params['eventId']
      tweetId: params['tweetId']
      tweetIdStr: params['tweetIdStr']
      text: params['text']
      mediaUrl: params['mediaUrl']
      displayUrl: params['displayUrl']
      hashTag: params['hashTag']
      createdAt: params['createdAt']
      userId: params['userId']
      userName: params['userName']
      screenName: params['screenName']
      profileImageUrl: params['profileImageUrl']

    tweet.save (err) ->
      callback()


class SlideProvider

  findSlidesByEventId: (params, callback) ->
    console.log "\n============> Slide findSlidesByEventId\n"
    Slide.find "$and": [
          serviceName: params['serviceName']
          eventId: params['eventId']
        ]
        .populate 'tweet'
        .sort createdAt: -1
         .exec (err, data) ->
           callback err, data

  save: (params, callback) ->
    console.log "\n============> Slide save\n"
    console.log params
    slide = new Slide
      tweetId: params['tweetId']
      tweetIdStr: params['tweetIdStr']
      url: params['url']
    slide.save (err, slide) ->
      callback err, slide

exports.EventProvider = new EventProvider()
exports.TweetProvider = new TweetProvider()
exports.SlideProvider = new SlideProvider()