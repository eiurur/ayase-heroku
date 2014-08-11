util   = require 'util'
moment = require 'moment'

my = ->

  c: (desciption, str) ->
    desciption = desciption || ''
    str = str || ''
    console.log "#{desciption}: #{str}"

  e: (desciption, str) ->
    desciption = desciption || ''
    str = str || ''
    console.error "#{desciption}: #{str}"

  dump: (obj) ->
    console.log util.inspect(obj,false,null)

  # _.includeではNGキーワードが文字列に含まれているか検査することができないので別に作成
  # hash_tagにNGキーワードが１つでも含まれていたらtrueを返す
  #
  # !array　としている理由は、everyメソッドは作成した条件に合わなかった時点で関数を終了させてfalseを返すため
  # 真偽値を反転させないと関数名にそぐわなくなるから
  #
  # 無駄がある。要リファクタリング
  include: (array, str) ->
    !array.every (elem, idx, array) ->
      str.indexOf(elem) is -1

  createParams: (params) ->
    ("#{k}=#{v}" for k, v of params).join('&')
    # => 'key=apikey&code=01234&start=0&rows=0'

  # UNIXTIMEを返す
  # 引数なし -> 現在時刻のUNIXTIME
  # 引数あり -> 指定時刻のUNIXTIME
  formatX: (time) ->
    if time?
      moment(time).format("X")
    else
      moment().format("X")

  formatYMD: (time) ->
    if time?
      moment(new Date(time)).format("YYYY-MM-DD")
    else
      moment().format("YYYY-MM-DD")

  formatYMDHms: (time) ->
    if time?
      moment(new Date(time)).format("YYYY-MM-DD HH:mm:ss")
    else
      moment().format("YYYY-MM-DD HH:mm:ss")

  # hours時間後の時刻をYYYY-MM-DD　の形式で返す
  addHoursFormatYMD: (hours, time) ->
    if time?
      moment(new Date(time)).add('h', hours).format("YYYY-MM-DD")
    else
      moment().add('h', hours).format("YYYY-MM-DD")

  # hours時間後の時刻をYYYY-MM-DD HH:mm:ss　の形式で返す
  addHoursFormatYMDHms: (hours, time) ->
    if time?
      moment(new Date(time)).add('h', hours).format("YYYY-MM-DD HH:mm:ss")
    else
      moment().add('h', hours).format("YYYY-MM-DD HH:mm:ss")

  # days日後の時刻をYYYY-MM-DDの形式で返す
  addDaysFormatYMD: (days, time) ->
    if time?
      moment(new Date(time)).add('d', days).format("YYYY-MM-DD")
    else
      moment().add('d', days).format("YYYY-MM-DD")


  # days日後の時刻をYYYYMMDD　の形式で返す
  addDaysFormatYYYYMMDD: (days, time) ->
    if time?
      moment(new Date(time)).add('d', days).format("YYYYMMDD")
    else
      moment().add('d', days).format("YYYYMMDD")

  # 今からdays日分の日時を YYYYMMDD の形式で返す
  getDaysYYYYMMDD: (days) ->
    ymds = []
    for day in [0...days]
      ymds[day] = moment(new Date()).add('d', day).format("YYYYMMDD")
      console.log ymds
    ymds

  # 引数の日の終わり間際の時間をYYYY-MM-DD 23:59:59 の形式で返す
  endBrinkFormatYMDHms: (time) ->
    if time?
      moment(time + " 23:59:59").format("YYYY-MM-DD HH:mm:ss")

  # 引数の日の開始直後の時間をYYYY-MM-DD 00:00:00 の形式で返す
  rigthAfterStartingFormatYMDHms: (time) ->
    if time?
      moment(time + " 00:00:00").format("YYYY-MM-DD HH:mm:ss")

  # 開始時刻と終了時刻が同じ日かどうか判定
  isSameDay: (startTimeYMD, endTimeYMD) ->
    if startTimeYMD is endTimeYMD then true else false

  # 開催日をstartedDateとしている
  getPeriod: (startTime, endTime) ->
    period = []
    startTimeYMD = @formatYMD startTime
    endTimeYMD = @formatYMD endTime
    if @isSameDay startTimeYMD, endTimeYMD
      period[0] =
        startedAt: startTime
        startedDate: startTimeYMD
        endedAt: endTime
    else
      # @c "ちがぇ！！"

      # @c "開始時刻 startTime", startTime
      # @c "終了時刻 endTime", endTime
      # @c "開始時刻", startTimeYMD
      # @c "終了時刻", endTimeYMD

      # 開始時刻と終了時刻の日付の差分を取得
      diffDays = moment(endTimeYMD).diff(moment(startTimeYMD), "days")
      # @c "差分", diffDays

      # その差分だけループを回す
      for i in [0..diffDays]
        # @c "index", i

        # 最初なら　startTime ~ YYYY-MM-DD 23:59:59
        if i is 0
          period[i] =
            startedAt: startTime
            startedDate: startTimeYMD
            endedAt: @endBrinkFormatYMDHms startTimeYMD

        # 中間なら YYYY-MM-DD 00:00:00 ~ YYYY-MM-DD 23:59:59
        else unless i is diffDays
          middleTime = @addDaysFormatYMD i, startTime
          period[i] =
            startedAt: @rigthAfterStartingFormatYMDHms middleTime
            startedDate: @formatYMD middleTime
            endedAt: @endBrinkFormatYMDHms middleTime

        # 最後なら YYYY-MM-DD 00:00:00 ~ endTime
        else
          period[i] =
            startedAt: @rigthAfterStartingFormatYMDHms endTimeYMD
            startedDate: endTimeYMD
            endedAt: endTime

    # @dump period

    period


exports.my = my()