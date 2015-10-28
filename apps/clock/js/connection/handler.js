define(function(require, exports) {
'use strict';

var handlers = {
  'gaia_alarm': require('./alarm'),
  'gaia_timer': require('./timer')
};

exports.init = function() {

  navigator.mozSetMessageHandler('connection', req => {
    var port = req.port;
    var handler = handlers[req.keyword];

    if (!handler) {
      console.error(`can't find handler for connection "${req.keyword}"`);
      return;
    }

    // IACMessagePort don't support onstart & onclose events as of 2015-07-21
    // but for timer we do need to emulate this behavior
    if (handler.onstart) {
      handler.onstart(req);
    }

    if (handler.onmessage || handler.onclose) {
      port.onmessage = event => {
        if (event.data.type === 'close' && handler.onclose) {
          handler.onclose(req);
          return;
        }
        handler.onmessage && handler.onmessage(event, port);
      };
    }
  });

  // Handle the activities
  navigator.mozSetMessageHandler('activity', function(activityRequest) {

    var option = activityRequest.source;
    var handler;
    var evt;

    if (option.name === "clock") {

      // We handle the alarm
      if (option.data.type === "alarm"){
        handler = handlers["gaia_alarm"];

        evt = new CustomEvent('message', {
          data: { time : "9:30am"}
        });

        // Create the output message
        handler.onmessage(evt, null, "6:30am");
        setTimeout(function(){
          // post back the results
          activityRequest.postResult("Alarm set");
        } , 2000);
      }

      if (option.data.type === "timer"){
        handler = handlers["gaia_timer"];
        evt = new CustomEvent('message', {
          data: { time : "9:30am"}
        });

        // Create the output message
        handler.onmessage(evt, null, "0:10");

        setTimeout(function(){
          alert('posting result');
          activityRequest.postResult("Timer set");
        } , 1000);
      }

    }


  });


};

});
