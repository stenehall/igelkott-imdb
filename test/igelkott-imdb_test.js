var assert = require('chai').assert,
    Stream = require('stream'),
    nock = require('nock'),

    Igelkott = require('igelkott'),
    Imdb = require('../igelkott-imdb.js').Plugin;


describe('Imdb', function() {

  var igelkott,
  config,
  s,
  server;

  beforeEach(function () {
    s = new Stream.PassThrough({objectMode: true});

    config = {
      "server": {
        "nick": "igelkott",
      },
      core:['privmsg'],
      plugins: {},
      'adapter': s, 'connect': function() { this.server.emit('connect'); }
    };

    igelkott = new Igelkott(config);
  });


  it('Should not respond at all on no match', function(done) {
    this.timeout(5000); // API queries are slow
    igelkott.plugin.load('imdb', {}, Imdb);

    igelkott.on('imdb:false', function() {
      done();
    });

    igelkott.connect();
    s.write(":dsmith!~dsmith@unaffiliated/dsmith PRIVMSG ##botbotbot :!imdb true tri\r\n");
  });


  it('Should respond with plot and rating', function(done) {
    igelkott.plugin.load('imdb', {}, Imdb);

    s.on('data', function(data) {
      if (data == "PRIVMSG ##botbotbot :dsmith: This is a description. (10.0)\r\n")
      {
        done();
      }
    });

    nock('http://www.omdbapi.com')
    .get('/?t=true%20grit')
    .reply(200, {"Plot":"This is a description.","imdbRating":"10.0", "Response": "True"});

    igelkott.connect();
    s.write(":dsmith!~dsmith@unaffiliated/dsmith PRIVMSG ##botbotbot :!imdb true grit\r\n");
  });


  it('Should get a response containing both plot and imdbRating (make sure the api haven\'t been updated)', function(done) {
    this.timeout(5000); // API queries are slow
    igelkott.plugin.load('imdb', {}, Imdb);

    igelkott.on('imdb:success', function(message, data) {
      assert.typeOf(data, 'object');
      assert.property(data, 'Plot');
      assert.property(data, 'imdbRating');
      done();
    });

    igelkott.connect();
    s.write(":dsmith!~dsmith@unaffiliated/dsmith PRIVMSG ##botbotbot :!imdb true grit\r\n");
  });

});
