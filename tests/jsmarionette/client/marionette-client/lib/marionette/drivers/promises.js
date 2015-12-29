var Tcp = require('./tcp');

Promises.Socket = Tcp.Socket;

var DEFAULT_HOST = 'localhost';
var DEFAULT_PORT = 2828;

function Promises(options) {
  if (!options) {
    options = {};
  }

  this.host = options.host || DEFAULT_HOST;
  this.port = options.port || DEFAULT_PORT;

  this.tcp = new Tcp(options);
}

Promises.prototype.connect = function() {
  var tcp = this.tcp;
  console.log("connectionid no connect: " + tcp.connectionId);
  return new Promise(function(resolve, reject) {
    tcp.connect(function(err) {
      return err ? reject(err) : resolve();
    });
  });
};

Promises.prototype.send = function(obj) {
  var tcp = this.tcp;
  console.log("connectionid no send: " + tcp.connectionId);
  return new Promise(function(resolve, reject) {
    console.log('sending');
    tcp._sendCommand(obj, function(err, res) {
      return err ? reject(err) : resolve(res);
    });

  });
};

Promises.prototype.close = function() {
  this.tcp.close();
};

module.exports = Promises;
