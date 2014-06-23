(function() {
  var TW_ACCESS_TOKEN_KEY, TW_ACCESS_TOKEN_SECRET, TW_CONSUMER_KEY, TW_CONSUMER_SECRET, Twitter;

  exports.NG_KEYWORDS = ['konkatsu', '結婚', '婚活', '子育て', 'セラピー', 'セラピスト', 'bookathon', 'outdoor', 'ヘイムスクリングラ', 'ふりーまーけっと', 'フリーマッケット', '講座', 'アイリッシュスローセッション', '朝活', 'deai', 'seakyak', 'surf', 'jazz', 'Jazz', 'ライブ'];

  exports.NG_USERS = ['upmeetup'];

  TW_CONSUMER_KEY = ENV[NODE_TW_CONSUMER_KEY];

  TW_CONSUMER_SECRET = ENV[NODE_TW_CONSUMER_SECRET];

  TW_ACCESS_TOKEN_KEY = ENV[NODE_TW_ACCESS_TOKEN_KEY];

  TW_ACCESS_TOKEN_SECRET = ENV[NODE_TW_ACCESS_TOKEN_SECRET];

  Twitter = require("ntwitter");

  exports.twitter = new Twitter({
    consumer_key: TW_CONSUMER_KEY,
    consumer_secret: TW_CONSUMER_SECRET,
    access_token_key: TW_ACCESS_TOKEN_KEY,
    access_token_secret: TW_ACCESS_TOKEN_SECRET
  });

  exports.ALLOWED_HOURS = 4;

}).call(this);
