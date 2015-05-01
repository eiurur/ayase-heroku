_        = require 'underscore-node'
request  = require 'request'
client   = require 'cheerio-httpcli'
my       = require('./my').my
s        = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")


exports.getSlideId = (params, callback) ->
  client.fetch params.url
  , (err, $, res) ->

    id = undefined

    if params.serviceName is 'slideshare'
      my.c "--------------  slideshare  -------------"
      meta = $('meta[name="twitter:player"]').attr('value')
      ptn =/\/\/www.slideshare.net\/slideshow\/embed_code\/key\/([\w]*)/i
      element = ptn.exec(meta)
      unless _.isNull element
        console.log element
        id = element[1]

    else if params.serviceName is 'speakerdeck'
      my.c "-----------  speakerdeck  ----------"
      meta = $('meta[name="twitter:image:src"]').attr("content")
      ptn = /presentations\/([\w]*)\//i
      element = ptn.exec(meta)
      unless _.isNull element
        console.log element
        id = element[1]

    callback null, id