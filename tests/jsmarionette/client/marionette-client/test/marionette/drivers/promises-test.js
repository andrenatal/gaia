/**
 * Created by anatal on 12/10/15.
 */
/* global assert, helper */
'use strict';
suite('marionette/drivers/promises', function() {

  if (typeof(window) !== 'undefined') {
    return;
  }

  var Driver = require('../../../lib/marionette/drivers/promises'),
    FakeSocket = require('../../support/socket');

  var subject,
    RealSocket,
    sockets = [];

  var socketRetry = require('socket-retry-connect');
  var realWaitForSocket;
  var net = require('net');
  var port = 60066;

  function issueFirstResponse() {
    subject.tcp._onDeviceResponse({
      id: subject.tcp.connectionId,
      response: {}
    });
  }

  setup(function() {
    subject = new Driver();

    realWaitForSocket = socketRetry.waitForSocket;

    RealSocket = Driver.Socket;
    subject.Socket = FakeSocket;
    FakeSocket.sockets = sockets;

    socketRetry.waitForSocket = function(options, callback) {
      var socket = new FakeSocket(options.port);
      callback(null, socket);
    };
  });

  teardown(function() {
    socketRetry.waitForSocket = realWaitForSocket;
    Driver.Socket = RealSocket;
  });


  test.skip('should return a fulfilled promise on connect', function(done) {
    setTimeout(function() {
      var server = net.createServer(function(socket) {
      }).listen(port);
    }, 50);

    var _promise = subject.connect();
    console.log(_promise);
    //assert(_promise == 'Promise');
    issueFirstResponse();

    console.log('esperando promises then' );
    _promise.then(
      function onFulfill(){
        console.log('onfiullfill');
        done();
      },
      function onReject(aRejectReason) {
        console.log('onReject:' + aRejectReason);
        console.log('newPromise failed with reason: ', aRejectReason);
      }
    );

  });


  test('should send an object and receive a promise', function(done) {
    setTimeout(function() {
      var server = net.createServer(function(socket) {
      }).listen(port);
    }, 50);

    // then we get a new promise for the connection
    var _promiseconnection = subject.connect();
    issueFirstResponse();

    // and wait..
    _promiseconnection.then(

      // fulfill of connect promise
      function onFulfill(){

          // then we get a new promise for the send
          var _promisesend= subject.send({type: 'foo'});

          // and wait..
          _promisesend.then(

            // fulfill of send promise
            function onFulfill(){

              console.log('on fullfill do send');

              done();
            },
            function onReject(aRejectReason) {
              console.log('onReject promise send:' + aRejectReason);
            }
          );

      },
      function onReject(aRejectReason) {
        console.log('onReject:' + aRejectReason);
      }
    );

  });
});

