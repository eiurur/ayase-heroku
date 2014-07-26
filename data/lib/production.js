(function() {
  var TW_ACCESS_TOKEN_KEY, TW_ACCESS_TOKEN_SECRET, TW_CONSUMER_KEY, TW_CONSUMER_SECRET, Twitter;

  exports.NG_KEYWORDS = ['konkatsu', '結婚', '婚活', '子育て', 'セラピー', 'セラピスト', 'bookathon', 'outdoor', 'ヘイムスクリングラ', 'ふりーまーけっと', 'フリーマッケット', '講座', 'アイリッシュスローセッション', '朝活', 'deai', 'seakyak', 'surf', 'jazz', 'Jazz', 'ライブ', '産後', 'ヘルパー', 'ベビーシッター', 'ブログセミナー', '営業', 'ラブ', '大人の', '売上', '情報発信', '戦略', 'おとな', '親子', 'ネットショップ', 'ワンコイン', 'スタンプ', 'ビール', '話題を', 'ラブ', 'ビジネス', 'ヘルスケア', '映画', 'English', '牛タン', '中華', 'シェフ', '料理', '魚', 'サラリーマン', 'カレー', '酒', '相談会', '発達障害', 'ヨガ', 'トレーナー', '小学生', '新規事業', '自治体', 'モノポリー', '子供', '子ども', 'こども', '愛情', '事業', 'BBQ'];

  exports.NG_USERS = ['upmeetup', 'CheckNAU', '_____test', 'design_manabu', '_newsrss', 'RSS_hateb_Roy', 'SEtenshoku', 'appproject_kago', 'ayase_notice', 'iNewsEnta', 'web_hot_news', 'htbtr_js', 'postnewshatena', 'pctoolnews', 'hatebu777', 'hatena_news', 'RSS_hateb_l_Roy', 'JapanTechFeeds', 'slidebot', 'interest_web', 'wJSnews'];

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

  exports.GRACE_TIME_DK = 150 * 1000;

  exports.GRACE_TIME_TWITTER = 1 * 1000;

  exports.GRACE_TIME_SERVER = 1 * 1000;

}).call(this);
