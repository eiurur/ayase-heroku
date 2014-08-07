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

TweetSchema = new Schema
  serviceName:
    type: String
    default: 'connpass'
  eventId: Number
  tweetId: Number
  tweetIdStr: String
  text: String
  hashTag: String
  createdAt: Date
  userId: String
  userName: String
  screenName: String
  profileImageUrl: String


##
# モデルへのアクセス
# mongoose.model 'モデル名', 定義したスキーマクラス
# を通して一度モデルを定義すると、同じ関数を通してアクセスすることができます
##
mongoose.model 'Event', EventSchema
mongoose.model 'Tweet', TweetSchema


##
# 定義した時の登録名で呼び出し
##
Event = mongoose.model 'Event'
Tweet = mongoose.model 'Tweet'


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

    Event.find {startedDate: params['nowDate']}
         .sort startedAt: -1
         .limit params["numShow"]
         .exec (err, data) ->
           callback err, data

  findInit: (params, callback) ->
    console.log "----- find init tweet greater than equal 10 -----"

    Event.find tweetNum: {$gte: 10}
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


  findByEventId: (params, callback) ->
    console.log "-------------------- find ----------------------"

    Event.find "$and": [
          serviceName: params['serviceName']
          eventId: params['eventId']
         ]
         .limit params["numShow"]
         .exec (err, data) ->
           callback err, data

  findByStartedDate: (params, callback) ->
    console.log "----------------- find Date --------------------"

    Event.find startedDate: params['startedDate']
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

  remove: (params, callback) ->
    console.log "remove"

    Event.remove {eventId: params['eventId']}, (err, data) ->
      callback err, data


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
      hashTag: params['hashTag']
      createdAt: params['createdAt']
      userId: params['userId']
      userName: params['userName']
      screenName: params['screenName']
      profileImageUrl: params['profileImageUrl']

    tweet.save (err) ->
      callback()


exports.EventProvider = new EventProvider()
exports.TweetProvider = new TweetProvider()