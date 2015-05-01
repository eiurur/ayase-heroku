_        = require 'underscore-node'
request  = require 'request'
client   = require 'cheerio-httpcli'
my       = require('./my').my
s        = if process.env.NODE_ENV is "production"
  require("./production")
else
  require("./development")


exports.getEmbedCode = (params, callback) ->
  client.fetch params.url
  , (err, $, res) ->

    embedCode = undefined

    if params.serviceName is 'slideshare'
      my.c "--------------  slideshare  -------------"
      meta = $('meta[name="twitter:player"]').attr('value')
      ptn =/(\/\/www.slideshare.net\/slideshow\/embed_code\/key\/[\w]*)/i
      element = ptn.exec(meta)
      unless _.isNull element
        id = ptn.exec(meta)[1]
        embedCode = "<iframe ng-src='#{id}' width='425' height='355' frameborder='0' marginwidth='0' marginheight='0' scrolling='no' style='border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;' allowfullscreen></iframe>"
        my.c "meta ", meta
        my.c "id ", id

    else if params.serviceName is 'speakerdeck'
      my.c "-----------  speakerdeck  ----------"
      meta = $('meta[name="twitter:image:src"]').attr("content")
      ptn = /presentations\/([\w]*)\//i
      element = ptn.exec(meta)
      unless _.isNull element
        id = element[1]
        embedCode = "<script async class='speakerdeck-embed' data-id='#{id}' data-ratio='1.33333333333333' src='//speakerdeck.com/assets/embed.js'></script>"
        my.c "meta ", meta
        my.c "id ", id

    callback null, embedCode