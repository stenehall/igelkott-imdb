var http = require('http'),
url = require('url');

var Imdb = function Imdb() {
  this.listeners = {'PRIVMSG': this.imdb, 'imdb:success': this.success, 'imdb:false': this._false};

  this.name = 'imdb';
  this.help = {
    "default": "Give you the plot and rating of a movie. Use !imdb <movie title> to search",
  };
};


Imdb.prototype.success = function success(message, response) {
  var obj = {
    command: 'PRIVMSG',
    parameters: [message.parameters[0], message.prefix.nick+': '+response.Plot+' ('+response.imdbRating+')']
  };
  this.igelkott.push(obj);
};


Imdb.prototype._false = function _false(message) {
  var obj = {
    command: 'PRIVMSG',
    parameters: [message.parameters[0], message.prefix.nick+': Sorry, couldn\'t complete your request']
  };
  this.igelkott.push(obj);
};


Imdb.prototype.imdb = function imdb(message) {
  var parts = message.parameters[1].split(' ');
  parts.shift();
  var path = '/?t='+encodeURI(parts.join(' '));
  http.get({ hostname: 'www.omdbapi.com', path: path }, this.parseRequest.bind(this, message));
};


Imdb.prototype.parseRequest = function parseRequest(message, response) {

  if (response.statusCode !== 200)
  {
    this.igelkott.emit('imdb:false', message);
  }
  else
  {
    response.body = "";

    response.on("data", function(chunk) {
      response.body = response.body + chunk;
    });

    response.on("end", function() {
      try{
        var content = JSON.parse(response.body);
        if(content.Response === 'True')
        {
          this.igelkott.emit('imdb:success', message, content);
        }
        else
        {
          this.igelkott.emit('imdb:false', message);
        }
      }
      catch(e) {
        this.igelkott.emit('imdb:false', message);
      }
    }.bind(this));
  }
};

exports.Plugin = Imdb;
