exports.TextOnlyTweetException = ->
  @errorHappendAt = new Date()
  @message = "Text Only"
  return

exports.UrlException = ->
  @errorHappendAt = new Date()
  @message = "URL is Exception"
  return

exports.NGUserException = ->
  @errorHappendAt = new Date()
  @message = "Contained NG user"
  return

exports.NGTweetException = ->
  @errorHappendAt = new Date()
  @message = "Contained NG word in the tweet"
  return

exports.isUnofficialRTException = ->
  @errorHappendAt = new Date()
  @message = "Unofficial RT is excluded"
  return

exports.NoTextTweetException = ->
  @errorHappendAt = new Date()
  @message = "No Text Tweet"
  return

exports.NoHashtagsTweetException = ->
  @errorHappendAt = new Date()
  @message = "No HashTags"
  return

exports.deadlinePassed = ->
  @errorHappendAt = new Date()
  @message = "deadline Passed"
  return
