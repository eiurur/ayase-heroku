util   = require 'util'
moment = require 'moment'

exports.c = (desciption, str) ->
  desciption = desciption || ''
  str = str || ''
  console.log "#{desciption}: #{str}"

exports.dump = (obj) ->
  console.log util.inspect(obj,false,null)

# _.includeではNGキーワードが文字列に含まれているか検査することができないので別に作成
# hash_tagにNGキーワードが１つでも含まれていたらtrueを返す
#
# !array　としている理由は、everyメソッドは作成した条件に合わなかった時点で関数を終了させてfalseを返すため
# 真偽値を反転させないと関数名にそぐわなくなるから
#
# 無駄がある。要リファクタリング
exports.include = (array, str) ->
  !array.every (elem, idx, array) ->
    str.indexOf(elem) is -1

exports.createParams = (params) ->
  ("#{k}=#{v}" for k, v of params).join('&')
  # => 'key=apikey&code=01234&start=0&rows=0'

exports.formatYMDHms = (time) ->
  moment(new Date(time)).format("YYYY-MM-DD HH:mm:ss")

# UNIXTIMEを返す
exports.formatX = (time) ->
  moment(time).format("X")

# 1時間後の時刻をYYYY-MM-DD HH:mm:ss　の形式で返す
exports.addHoursFormatYMDHms = (hours, time) ->
  moment(new Date(time)).add('h', hours).format("YYYY-MM-DD HH:mm:ss")
