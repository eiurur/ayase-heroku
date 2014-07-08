exports.serve = function() {

  /**
   * Module dependencies
   */
  var express = require('express')
    , routes  = require('./routes')
    , api     = require('./routes/api')
    , http    = require('http')
    , path    = require('path')
    , util    = require('util')
    , app     = module.exports = express()
    , server  = http.createServer(app)
    ;



  /**
   * Configuration
   */

  // all environments

  // 攻撃者にバックエンドのサーバーが何か伝えない。
  app.disable('x-powered-by');
  app.set('port', process.env.PORT || 3210);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.favicon('images/ayase.ico'));
  app.use(app.router);
  app.use(function(req, res, next){
    res.status(404);
    res.render('404', {title: "お探しのページは存在しません。"});
  });


  // development only
  if (app.get('env') === 'development') {
    app.use(express.errorHandler());
    app.locals.pretty = true;
  }

  // production only
  if (app.get('env') === 'production') {
    // TODO

  }


  /**
   * Routes
   */

  // serve index and view partials
  app.get('/', routes.index);
  app.get('/partials/:name', routes.partials);

  // JSON API
  // app.get('/api/readEventStartedAtDesc/', api.readEventStartedAtDesc);
  app.get('/api/readInitEvent/', api.readInitEvent);
  app.get('/api/readAllEvent/', api.readAllEvent);
  app.get('/api/readEventOnTheDay/', api.readEventOnTheDay);

  app.get('/api/readTweet/:eventId', api.readTweet);
  app.get('/api/readRestTweet/:eventId', api.readRestTweet);
  app.get('/api/readEventByEventId/:eventId', api.readEventByEventId);

  app.get('*', routes.index);


  /**
   * Start Server
   */
  http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
}

