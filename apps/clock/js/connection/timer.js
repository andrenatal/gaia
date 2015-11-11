define(function(require, exports) {
'use strict';

var Timer = require('timer');
var parseDuration = require('ext/parse_duration');
var port;
var timer;

exports.onstart = function(request) {
  port = request.port;

  window.addEventListener('timer-start', onTimerEvent);
  window.addEventListener('timer-pause', onTimerEvent);
  window.addEventListener('timer-end', onTimerEvent);
  window.addEventListener('timer-tick', onTimerEvent);
};

exports.onclose = function() {
  port = null;
  timer = null;

  window.removeEventListener('timer-start', onTimerEvent);
  window.removeEventListener('timer-pause', onTimerEvent);
  window.removeEventListener('timer-end', onTimerEvent);
  window.removeEventListener('timer-tick', onTimerEvent);
};

function onTimerEvent(evt) {
  if (!port) {
    return;
  }

  port.postMessage({
    type: evt.type,
    remaining: evt.detail.remaining
  });
}

exports.onmessage = function(event, port, time) {
  if (timer) {
    exec(event, port, time);
  } else {
    Timer.singleton((err, t) => {
      timer = t;
      exec(event, port, time);
    });
  }
};

function exec(event, port, time) {
  //var { type, duration } = ["create", "00:10"]; //event.data;
  var type = "create";
  //alert("antes" + JSON.stringify(event) );
  var duration = time;
  //alert(duration);
  if (type === 'create') {
    create(duration);
    return;
  }
  // type: [start, pause, cancel]
  timer[type]();
  timer.commit();
}

function create(inputDuration) {
  var duration = parseDuration(String(inputDuration));

  if (!duration) {
    port.postMessage({
      error: `Invalid timer duration "${inputDuration}"`
    });
    return;
  }

  // we don't check the timer state since we assume the user wants to override
  // any running timer and start it immediately
  timer.duration = duration;
  timer.start();
  timer.commit();
}

});
