(function() {
  var TW_ACCESS_TOKEN_KEY, TW_ACCESS_TOKEN_SECRET, TW_CONSUMER_KEY, TW_CONSUMER_SECRET, Twitter;

  exports.NG_KEYWORDS = ['konkatsu', '結婚', '婚活', '子育て', 'セラピー', 'セラピスト', 'bookathon', 'outdoor', 'ヘイムスクリングラ', 'ふりーまーけっと', 'フリーマッケット', '講座', 'アイリッシュスローセッション', '朝活', 'deai', 'seakyak', 'surf', 'jazz', 'Jazz', 'ライブ'];

  exports.NG_USERS = ['upmeetup', 'CheckNAU', '_____test', 'design_manabu', '_newsrss', 'RSS_hateb_Roy', 'SEtenshoku', 'appproject_kago', 'ayase_notice'];

  TW_CONSUMER_KEY = process.env.TW_CONSUMER_KEY;

  TW_CONSUMER_SECRET = process.env.TW_CONSUMER_SECRET;

  TW_ACCESS_TOKEN_KEY = process.env.TW_ACCESS_TOKEN_KEY;

  TW_ACCESS_TOKEN_SECRET = process.env.TW_ACCESS_TOKEN_SECRET;

  Twitter = require("ntwitter");

  exports.twitter = new Twitter({
    consumer_key: TW_CONSUMER_KEY,
    consumer_secret: TW_CONSUMER_SECRET,
    access_token_key: TW_ACCESS_TOKEN_KEY,
    access_token_secret: TW_ACCESS_TOKEN_SECRET
  });

  exports.ALLOWED_HOURS = 4;

  exports.GRACE_TIME_CONNPASS = 10 * 1000;

  exports.GRACE_TIME_TWITTER = 1 * 1000;

  exports.GRACE_TIME_SERVER = 1 * 1000;

}).call(this);
