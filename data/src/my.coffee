util   = require 'util'
moment = require 'moment'


exports.c = (desciption, str) ->
  desciption = desciption || ''
  str = str || ''
  console.log "#{desciption}: #{str}"


exports.e = (desciption, str) ->
  desciption = desciption || ''
  str = str || ''
  console.error "#{desciption}: #{str}"


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


# UNIXTIMEを返す
# 引数なし -> 現在時刻のUNIXTIME
# 引数あり -> 指定時刻のUNIXTIME
exports.formatX = (time) ->
  if time?
    moment(time).format("X")
  else
    moment().format("X")


exports.formatYMD = (time) ->
  if time?
    moment(new Date(time)).format("YYYY-MM-DD")
  else
    moment().format("YYYY-MM-DD")


exports.formatYMDHms = (time) ->
  if time?
    moment(new Date(time)).format("YYYY-MM-DD HH:mm:ss")
  else
    moment().format("YYYY-MM-DD HH:mm:ss")


# hours時間後の時刻をYYYY-MM-DD　の形式で返す
exports.addHoursFormatYMD = (hours, time) ->
  if time?
    moment(new Date(time)).add('h', hours).format("YYYY-MM-DD")
  else
    moment().add('h', hours).format("YYYY-MM-DD")


# hours時間後の時刻をYYYY-MM-DD HH:mm:ss　の形式で返す
exports.addHoursFormatYMDHms = (hours, time) ->
  if time?
    moment(new Date(time)).add('h', hours).format("YYYY-MM-DD HH:mm:ss")
  else
    moment().add('h', hours).format("YYYY-MM-DD HH:mm:ss")


# days日後の時刻をYYYY-MM-DDの形式で返す
exports.addDaysFormatYMD = (days, time) ->
  if time?
    moment(new Date(time)).add('d', days).format("YYYY-MM-DD")
  else
    moment().add('d', days).format("YYYY-MM-DD")


# days日後の時刻をYYYYMMDD　の形式で返す
exports.addDaysFormatYYYYMMDD = (days, time) ->
  if time?
    moment(new Date(time)).add('d', days).format("YYYYMMDD")
  else
    moment().add('d', days).format("YYYYMMDD")


# 今からdays日分の日時を YYYYMMDD の形式で返す
exports.getDaysYYYYMMDD = (days) ->
  ymds = []
  for day in [0...days]
    ymds[day] = moment(new Date()).add('d', day).format("YYYYMMDD")
    console.log ymds
  ymds


# hours時間後の時刻をYYYY-MM-DD HH:mm:ss　の形式で返す
exports.endBrinkFormatYMDHms = (time) ->
  if time?
    moment(time + " 23:59:59").format("YYYY-MM-DD HH:mm:ss")
  # else
  #   moment().add('h', hours).format("YYYY-MM-DD HH:mm:ss")
