(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
;(function (f) {
  if (typeof define === 'function' && define.amd) {
    define('keen', [], function(){ return f(); });
  }
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = f();
  }
  var g = null;
  if (typeof window !== 'undefined') {
    g = window;
  } else if (typeof global !== 'undefined') {
    g = global;
  } else if (typeof self !== 'undefined') {
    g = self;
  }
  if (g) {
    g.Keen = f();
  }
})(function() {
  'use strict';
  var Keen = require('./');
  var extend = require('./utils/extend');
  extend(Keen.Client.prototype, require('./record-events-browser'));
  extend(Keen.Client.prototype, require('./defer-events'));
  extend(Keen.Client.prototype, {
    'extendEvent': require('./extend-events').extendEvent,
    'extendEvents': require('./extend-events').extendEvents
  });
  extend(Keen.helpers, {
    'getBrowserProfile'  : require('./helpers/getBrowserProfile'),
    'getDatetimeIndex'   : require('./helpers/getDatetimeIndex'),
    'getDomEventProfile' : require('./helpers/getDomEventProfile'),
    'getDomNodePath'     : require('./helpers/getDomNodePath'),
    'getScreenProfile'   : require('./helpers/getScreenProfile'),
    'getUniqueId'        : require('./helpers/getUniqueId'),
    'getWindowProfile'   : require('./helpers/getWindowProfile')
  });
  extend(Keen.utils, {
    'cookie'     : require('./utils/cookie'),
    'deepExtend' : require('./utils/deepExtend'),
    'each'       : require('./utils/each'),
    'extend'     : extend,
    'parseParams': require('./utils/parseParams'),
    'timer'      : require('./utils/timer')
  });
  Keen.noConflict = function(){
    root.Keen = previousKeen;
    return Keen;
  };
  Keen.ready = function(fn){
    if (Keen.loaded) {
      fn();
    }
    else {
      Keen.once('ready', fn);
    }
  };
  domReady(function(){
    Keen.loaded = true;
    Keen.emit('ready');
  });
  function domReady(fn){
    if (Keen.loaded || 'undefined' === typeof document) {
      fn();
      return;
    }
    if(document.readyState == null && document.addEventListener){
      document.addEventListener("DOMContentLoaded", function DOMContentLoaded(){
        document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
        document.readyState = "complete";
      }, false);
      document.readyState = "loading";
    }
    testDom(fn);
  }
  function testDom(fn){
    if (/in/.test(document.readyState)) {
      setTimeout(function(){
        testDom(fn);
      }, 9);
    }
    else {
      fn();
    }
  };
  if (!Array.prototype.indexOf){
    Array.prototype.indexOf = function(elt /*, from*/) {
      var len = this.length >>> 0;
      var from = Number(arguments[1]) || 0;
      from = (from < 0)
           ? Math.ceil(from)
           : Math.floor(from);
      if (from < 0)
        from += len;
      for (; from < len; from++) {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }
  module.exports = Keen;
  return Keen;
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./":11,"./defer-events":2,"./extend-events":3,"./helpers/getBrowserProfile":4,"./helpers/getDatetimeIndex":5,"./helpers/getDomEventProfile":6,"./helpers/getDomNodePath":7,"./helpers/getScreenProfile":8,"./helpers/getUniqueId":9,"./helpers/getWindowProfile":10,"./record-events-browser":12,"./utils/cookie":14,"./utils/deepExtend":15,"./utils/each":16,"./utils/extend":17,"./utils/parseParams":18,"./utils/timer":20}],2:[function(require,module,exports){
var Keen = require('./index');
var each = require('./utils/each');
var queue = require('./utils/queue');
module.exports = {
  'deferEvent': deferEvent,
  'deferEvents': deferEvents,
  'queueCapacity': queueCapacity,
  'queueInterval': queueInterval,
  'recordDeferredEvents': recordDeferredEvents
};
function deferEvent(eventCollection, eventBody){
  if (arguments.length !== 2 || typeof eventCollection !== 'string') {
    handleValidationError.call(this, 'Incorrect arguments provided to #deferEvent method');
    return;
  }
  this.queue.events[eventCollection] = this.queue.events[eventCollection] || [];
  this.queue.events[eventCollection].push(eventBody);
  this.queue.capacity++;
  this.emit('deferEvent', eventCollection, eventBody);
  return this;
}
function deferEvents(eventsHash){
  var self = this;
  if (arguments.length !== 1 || typeof eventsHash !== 'object') {
    handleValidationError.call(this, 'Incorrect arguments provided to #deferEvents method');
    return;
  }
  each(eventsHash, function(eventList, eventCollection){
    self.queue.events[eventCollection] = self.queue.events[eventCollection] || [];
    self.queue.events[eventCollection] = self.queue.events[eventCollection].concat(eventList);
    self.queue.capacity = self.queue.capacity + eventList.length;
  });
  self.emit('deferEvents', eventsHash);
  return self;
}
function queueCapacity(num){
  if (!arguments.length) return this.queue.config.capacity;
  this.queue.config.capacity = num ? Number(num): 0;
  return this;
}
function queueInterval(num){
  if (!arguments.length) return this.queue.config.interval;
  this.queue.config.interval = num ? Number(num): 0;
  return this;
}
function recordDeferredEvents(){
  var self = this, currentQueue;
  if (self.queue.capacity > 0) {
    currentQueue = JSON.parse(JSON.stringify(self.queue));
    self.queue = queue();
    self.queue.options = currentQueue.options;
    self.emit('recordDeferredEvents', currentQueue.events);
    self.recordEvents(currentQueue.events, function(err, res){
      if (err) {
        self.recordEvents(currentQueue.events);
      }
      else {
        currentQueue = void 0;
      }
    });
  }
  return self;
}
function handleValidationError(message){
  var err = 'Event(s) not deferred: ' + message;
  this.emit('error', err);
}
},{"./index":11,"./utils/each":16,"./utils/queue":19}],3:[function(require,module,exports){
var deepExtend = require('./utils/deepExtend');
var each = require('./utils/each');
module.exports = {
  'extendEvent': extendEvent,
  'extendEvents': extendEvents,
  'getExtendedEventBody': getExtendedEventBody
};
function extendEvent(eventCollection, eventModifier){
  if (arguments.length !== 2 || typeof eventCollection !== 'string'
    || ('object' !== typeof eventModifier && 'function' !== typeof eventModifier)) {
      handleValidationError.call(this, 'Incorrect arguments provided to #extendEvent method');
      return;
  }
  this.extensions.collections[eventCollection] = this.extensions.collections[eventCollection] || [];
  this.extensions.collections[eventCollection].push(eventModifier);
  this.emit('extendEvent', eventCollection, eventModifier);
  return this;
}
function extendEvents(eventsModifier){
  if (arguments.length !== 1 || ('object' !== typeof eventsModifier && 'function' !== typeof eventsModifier)) {
    handleValidationError.call(this, 'Incorrect arguments provided to #extendEvents method');
    return;
  }
  this.extensions.events.push(eventsModifier);
  this.emit('extendEvents', eventsModifier);
  return this;
}
function handleValidationError(message){
  var err = 'Event(s) not extended: ' + message;
  this.emit('error', err);
}
function getExtendedEventBody(result, queue){
  if (queue && queue.length > 0) {
    each(queue, function(eventModifier, i){
      var modifierResult = (typeof eventModifier === 'function') ? eventModifier() : eventModifier;
      deepExtend(result, modifierResult);
    });
  }
  return result;
}
},{"./utils/deepExtend":15,"./utils/each":16}],4:[function(require,module,exports){
var getScreenProfile = require('./getScreenProfile'),
    getWindowProfile = require('./getWindowProfile');
function getBrowserProfile(){
  return {
    'cookies'  : ('undefined' !== typeof navigator.cookieEnabled) ? navigator.cookieEnabled : false,
    'codeName' : navigator.appCodeName,
    'language' : navigator.language,
    'name'     : navigator.appName,
    'online'   : navigator.onLine,
    'platform' : navigator.platform,
    'useragent': navigator.userAgent,
    'version'  : navigator.appVersion,
    'screen'   : getScreenProfile(),
    'window'   : getWindowProfile()
  }
}
module.exports = getBrowserProfile;
},{"./getScreenProfile":8,"./getWindowProfile":10}],5:[function(require,module,exports){
function getDateTimeIndex(input){
  var date = input || new Date();
  return {
    'hour-of-day'  : date.getHours(),
    'day-of-week'  : parseInt( 1 + date.getDay() ),
    'day-of-month' : date.getDate(),
    'month'        : parseInt( 1 + date.getMonth() ),
    'year'         : date.getFullYear()
  };
}
module.exports = getDateTimeIndex;
},{}],6:[function(require,module,exports){
function getDomEventProfile(e){
  if (!arguments.length) return {};
}
module.exports = getDomEventProfile;
},{}],7:[function(require,module,exports){
/*!
  via: http://stackoverflow.com/a/16742828/2511985
  */
function getDomNodePath(el){
  if (!el.nodeName) return '';
  var stack = [];
  while ( el.parentNode != null ) {
    var sibCount = 0;
    var sibIndex = 0;
    for ( var i = 0; i < el.parentNode.childNodes.length; i++ ) {
      var sib = el.parentNode.childNodes[i];
      if ( sib.nodeName == el.nodeName ) {
        if ( sib === el ) {
          sibIndex = sibCount;
        }
        sibCount++;
      }
    }
    if ( el.hasAttribute('id') && el.id != '' ) {
      stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
    } else if ( sibCount > 1 ) {
      stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
    } else {
      stack.unshift(el.nodeName.toLowerCase());
    }
    el = el.parentNode;
  }
  return stack.slice(1).join(' > ');
}
module.exports = getDomNodePath;
},{}],8:[function(require,module,exports){
function getScreenProfile(){
  var keys, output;
  if ('undefined' == typeof window || !window.screen) return {};
  keys = ['height', 'width', 'colorDepth', 'pixelDepth', 'availHeight', 'availWidth'];
  output = {};
  for (var i = 0; i < keys.length; i++) {
    output[keys[i]] = window.screen[keys[i]] ? window.screen[keys[i]] : null;
  }
  output.orientation = {
    'angle' : window.screen.orientation ? window.screen.orientation['angle'] : 0,
    'type'  : window.innerWidth > window.innerHeight ? 'landscape': 'portrait'
  };
  return output;
}
module.exports = getScreenProfile;
},{}],9:[function(require,module,exports){
function getUniqueId(){
}
module.exports = getUniqueId;
},{}],10:[function(require,module,exports){
function getWindowProfile(){
  var body, html, output;
  if ('undefined' == typeof document) return {};
  body = document.body;
  html = document.documentElement;
  output = {
    'height': ('innerHeight' in window) ? window.innerHeight : document.documentElement.offsetHeight,
    'width': ('innerWidth' in window) ? window.innerWidth : document.documentElement.offsetWidth,
    'scrollHeight': Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight ) || null
  };
  if (window.screen) {
    output.ratio = {
      'height': (window.screen.availHeight) ? parseFloat( (window.innerHeight/window.screen.availHeight).toFixed(2) ) : null,
      'width': (window.screen.availWidth) ? parseFloat( (window.innerWidth/window.screen.availWidth).toFixed(2) ) : null
    };
  }
  return output;
}
module.exports = getWindowProfile;
/*
  Notes:
    document.documentElement.offsetHeight/Width is a workaround for IE8 and below, where window.innerHeight/Width is undefined
*/
},{}],11:[function(require,module,exports){
var Emitter = require('component-emitter');
var JSON2 = require('JSON2');
var each = require('./utils/each');
var queue = require('./utils/queue');
var root = this;
var previousKeen = root.Keen;
var Keen = {
  debug: false,
  enabled: true,
  loaded: false,
  helpers: {},
  utils: {},
  version: '0.0.1'
};
Keen.Client = function(cfg){
  this.configure(cfg);
  Keen.emit('client', this);
}
Keen.Client.prototype.configure = function(cfg){
  var self = this, config = cfg || {}, defaultProtocol;
  if (config['host']) {
    config['host'].replace(/.*?:\/\//g, '');
  }
  defaultProtocol = 'https';
  if ('undefined' !== typeof document && document.all) {
    config['protocol'] = (document.location.protocol !== 'https:') ? 'http' : defaultProtocol;
  }
  self.config = {
    projectId   : config.projectId,
    writeKey    : config.writeKey,
    host        : config['host']     || 'api.keen.io',
    protocol    : config['protocol'] || defaultProtocol,
    requestType : config.requestType || 'jsonp',
    writePath   : config.writePath,
  };
  self.queue = queue();
  self.queue.on('flush', function(){
    self.recordDeferredEvents();
  });
  self.extensions = {
    events: [],
    collections: {}
  };
  if (Keen.debug) {
    self.on('error', Keen.log);
  }
  self.emit('ready');
  return self;
};
Keen.Client.prototype.projectId = function(str){
  if (!arguments.length) return this.config.projectId;
  this.config.projectId = (str ? String(str) : null);
  return this;
};
Keen.Client.prototype.writeKey = function(str){
  if (!arguments.length) return this.config.writeKey;
  this.config.writeKey = (str ? String(str) : null);
  return this;
};
Keen.Client.prototype.writePath = function(str){
  if (!arguments.length) {
    if (!this.projectId()) {
      this.emit('error', 'Keen.Client is missing a projectId property');
      return;
    }
    return this.config.writePath ? this.config.writePath : ('/3.0/projects/' + this.projectId() + '/events');
  }
  this.config.writePath = (str ? String(str) : null);
  return this;
};
Keen.Client.prototype.url = function(path, data){
  var url;
  if (!this.projectId()) {
    this.emit('error', 'Keen.Client is missing a projectId property');
    return;
  }
  url = this.config.protocol + '://' + this.config.host + '/3.0/projects/' + this.projectId();
  if (path) {
    url += path;
  }
  if (data) {
    url += '?' + serialize(data);
  }
  return url;
};
function serialize(data){
  var query = [];
  each(data, function(value, key){
    if ('string' !== typeof value) {
      value = JSON2.stringify(value);
    }
    query.push(key + '=' + encodeURIComponent(value));
  });
  return query.join('&');
}
Emitter(Keen);
Emitter(Keen.Client.prototype);
Keen.log = function(message) {
  if (Keen.debug && typeof console == 'object') {
    console.log('[Keen IO]', message);
  }
};
module.exports = Keen;
},{"./utils/each":16,"./utils/queue":19,"JSON2":22,"component-emitter":24}],12:[function(require,module,exports){
var Keen = require('./index');
var base64 = require('./utils/base64');
var each = require('./utils/each');
var extendEvents = require('./extend-events');
var JSON2 = require('JSON2');
module.exports = {
  'recordEvent': recordEvent,
  'recordEvents': recordEvents
};
function recordEvent(eventCollection, eventBody, callback){
  var url, data, cb, getRequestUrl, extendedEventBody;
  url = this.url('/events/' + encodeURIComponent(eventCollection));
  data = eventBody || {};
  cb = callback;
  if (!checkValidation.call(this, cb)) {
    return;
  }
  if (!eventCollection || typeof eventCollection !== 'string') {
    handleValidationError.call(this, 'Collection name must be a string.', cb);
    return;
  }
  extendedEventBody = {};
  extendEvents.getExtendedEventBody(extendedEventBody, this.extensions.events);
  extendEvents.getExtendedEventBody(extendedEventBody, this.extensions.collections[eventCollection]);
  extendEvents.getExtendedEventBody(extendedEventBody, [data]);
  this.emit('recordEvent', eventCollection, extendedEventBody);
  if (!Keen.enabled) {
    handleValidationError.call(this, 'Keen.enabled is set to false.', cb);
    return false;
  }
  getRequestUrl = this.url('/events/' + encodeURIComponent(eventCollection), {
    api_key  : this.writeKey(),
    data     : base64.encode(JSON2.stringify(extendedEventBody)),
    modified : new Date().getTime()
  });
  if (getRequestUrl.length < getUrlMaxLength()) {
    switch (this.config.requestType) {
      case 'xhr':
        sendXhr.call(this, 'GET', getRequestUrl, null, null, cb);
        break;
      case 'beacon':
        sendBeacon.call(this, getRequestUrl, cb);
        break;
      default:
        sendJSONp.call(this, getRequestUrl, cb);
        break;
    }
  }
  else if (getXhr()) {
    sendXhr.call(this, 'POST', url, extendedEventBody, cb);
  }
  else {
    handleValidationError.call(this, 'URL length exceeds current browser limit, and XHR is not supported.');
  }
  callback = cb = null;
  return this;
}
function recordEvents(eventsHash, callback){
  var self = this, url, cb, extendedEventsHash;
  url = this.url('/events');
  cb = callback;
  callback = null;
  if (!checkValidation.call(this, cb)) {
    return;
  }
  if ('object' !== typeof eventsHash || eventsHash instanceof Array) {
    handleValidationError.call(this, 'First argument must be an object', cb);
    return;
  }
  if (arguments.length > 2) {
    handleValidationError.call(this, 'Incorrect arguments provided to #recordEvents method', cb);
    return;
  }
  extendedEventsHash = {};
  each(eventsHash, function(eventList, eventCollection){
    extendedEventsHash[eventCollection] = extendedEventsHash[eventCollection] || [];
    each(eventList, function(eventBody, index){
      var extendedEventBody = {};
      extendEvents.getExtendedEventBody(extendedEventBody, self.extensions.events);
      extendEvents.getExtendedEventBody(extendedEventBody, self.extensions.collections[eventCollection]);
      extendEvents.getExtendedEventBody(extendedEventBody, [eventBody]);
      extendedEventsHash[eventCollection].push(extendedEventBody);
    });
  });
  this.emit('recordEvents', extendedEventsHash);
  if (!Keen.enabled) {
    handleValidationError.call(this, 'Keen.enabled is set to false.', cb);
    return false;
  }
  if (getXhr()) {
    sendXhr.call(this, 'POST', url, extendedEventsHash, cb);
  }
  else {
  }
  callback = cb = null;
  return this;
}
function checkValidation(callback){
  var cb = callback;
  callback = null;
  if (!this.projectId()) {
    handleValidationError.call(this, 'Keen.Client is missing a projectId property.', cb);
    return false;
  }
  if (!this.writeKey()) {
    handleValidationError.call(this, 'Keen.Client is missing a writeKey property.', cb);
    return false;
  }
  return true;
}
function handleValidationError(message, cb){
  var err = 'Event(s) not recorded: ' + message;
  this.emit('error', err);
  if (cb) {
    cb.call(this, err, null);
    cb = null;
  }
}
function getUrlMaxLength(){
  if ('undefined' !== typeof window) {
    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
      return 2000;
    }
  }
  return 16000;
}
function sendXhr(method, url, data, callback){
  var self = this;
  var payload;
  var xhr = getXhr();
  var cb = callback;
  callback = null;
  xhr.onreadystatechange = function() {
    var response;
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          response = JSON2.parse(xhr.responseText);
        } catch (e) {
          Keen.emit('error', 'Could not parse HTTP response: ' + xhr.responseText);
          if (cb) {
            cb.call(self, xhr, null);
          }
        }
        if (cb && response) {
          cb.call(self, null, response);
        }
      }
      else {
        Keen.emit('error', 'HTTP request failed.');
        if (cb) {
          cb.call(self, xhr, null);
        }
      }
    }
  };
  xhr.open(method, url, true);
  xhr.setRequestHeader('Authorization', self.writeKey());
  xhr.setRequestHeader('Content-Type', 'application/json');
  if (data) {
    payload = JSON2.stringify(data);
  }
  if (method.toUpperCase() === 'GET') {
    xhr.send();
  }
  if (method.toUpperCase() === 'POST') {
    xhr.send(payload);
  }
}
function getXhr() {
  var root = 'undefined' == typeof window ? this : window;
  if (root.XMLHttpRequest && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};
function sendJSONp(url, callback){
  var self = this,
      cb = callback,
      timestamp = new Date().getTime(),
      script = document.createElement('script'),
      parent = document.getElementsByTagName('head')[0],
      callbackName = 'keenJSONPCallback',
      loaded = false;
  callback = null;
  callbackName += timestamp;
  while (callbackName in window) {
    callbackName += 'a';
  }
  window[callbackName] = function(response) {
    if (loaded === true) return;
    loaded = true;
    if (cb) {
      cb.call(self, null, response);
    }
    cleanup();
  };
  script.src = url + '&jsonp=' + callbackName;
  parent.appendChild(script);
  script.onreadystatechange = function() {
    if (loaded === false && this.readyState === 'loaded') {
      loaded = true;
      handleError();
      cleanup();
    }
  };
  script.onerror = function() {
    if (loaded === false) {
      loaded = true;
      handleError();
      cleanup();
    }
  };
  function handleError(){
    if (cb) {
      cb.call(self, 'An error occurred!', null);
    }
  }
  function cleanup(){
    window[callbackName] = undefined;
    try {
      delete window[callbackName];
    } catch(e){};
    parent.removeChild(script);
  }
}
function sendBeacon(url, callback){
  var self = this,
      cb = callback,
      img = document.createElement('img'),
      loaded = false;
  callback = null;
  img.onload = function() {
    loaded = true;
    if ('naturalHeight' in this) {
      if (this.naturalHeight + this.naturalWidth === 0) {
        this.onerror();
        return;
      }
    } else if (this.width + this.height === 0) {
      this.onerror();
      return;
    }
    if (cb) {
      cb.call(self);
    }
  };
  img.onerror = function() {
    loaded = true;
    if (cb) {
      cb.call(self, 'An error occurred!', null);
    }
  };
  img.src = url + '&c=clv1';
}
},{"./extend-events":3,"./index":11,"./utils/base64":13,"./utils/each":16,"JSON2":22}],13:[function(require,module,exports){
module.exports = {
  map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (n) {
    "use strict";
    var o = "", i = 0, m = this.map, i1, i2, i3, e1, e2, e3, e4;
    n = this.utf8.encode(n);
    while (i < n.length) {
      i1 = n.charCodeAt(i++); i2 = n.charCodeAt(i++); i3 = n.charCodeAt(i++);
      e1 = (i1 >> 2); e2 = (((i1 & 3) << 4) | (i2 >> 4)); e3 = (isNaN(i2) ? 64 : ((i2 & 15) << 2) | (i3 >> 6));
      e4 = (isNaN(i2) || isNaN(i3)) ? 64 : i3 & 63;
      o = o + m.charAt(e1) + m.charAt(e2) + m.charAt(e3) + m.charAt(e4);
    } return o;
  },
  decode: function (n) {
    "use strict";
    var o = "", i = 0, m = this.map, cc = String.fromCharCode, e1, e2, e3, e4, c1, c2, c3;
    n = n.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < n.length) {
      e1 = m.indexOf(n.charAt(i++)); e2 = m.indexOf(n.charAt(i++));
      e3 = m.indexOf(n.charAt(i++)); e4 = m.indexOf(n.charAt(i++));
      c1 = (e1 << 2) | (e2 >> 4); c2 = ((e2 & 15) << 4) | (e3 >> 2);
      c3 = ((e3 & 3) << 6) | e4;
      o = o + (cc(c1) + ((e3 != 64) ? cc(c2) : "")) + (((e4 != 64) ? cc(c3) : ""));
    } return this.utf8.decode(o);
  },
  utf8: {
    encode: function (n) {
      "use strict";
      var o = "", i = 0, cc = String.fromCharCode, c;
      while (i < n.length) {
        c = n.charCodeAt(i++); o = o + ((c < 128) ? cc(c) : ((c > 127) && (c < 2048)) ?
        (cc((c >> 6) | 192) + cc((c & 63) | 128)) : (cc((c >> 12) | 224) + cc(((c >> 6) & 63) | 128) + cc((c & 63) | 128)));
        } return o;
    },
    decode: function (n) {
      "use strict";
      var o = "", i = 0, cc = String.fromCharCode, c2, c;
      while (i < n.length) {
        c = n.charCodeAt(i);
        o = o + ((c < 128) ? [cc(c), i++][0] : ((c > 191) && (c < 224)) ?
        [cc(((c & 31) << 6) | ((c2 = n.charCodeAt(i + 1)) & 63)), (i += 2)][0] :
        [cc(((c & 15) << 12) | (((c2 = n.charCodeAt(i + 1)) & 63) << 6) | ((c3 = n.charCodeAt(i + 2)) & 63)), (i += 3)][0]);
      } return o;
    }
  }
};
},{}],14:[function(require,module,exports){
var Cookies = require('cookies-js');
var JSON2 = require('JSON2');
var extend = require('./extend');
module.exports = cookie;
function cookie(str){
  if (!arguments.length) return;
  if (this instanceof cookie === false) {
    return new cookie(str);
  }
  this.config = {
    key: str,
    options: {}
  };
  this.data = this.get();
  return this;
}
cookie.prototype.get = function(str){
  var data = Cookies.get(this.config.key) ? JSON2.parse( decodeURIComponent(Cookies.get(this.config.key)) ) : {};
  return (str && typeof data[str] !== 'undefined') ? data[str] : data;
};
cookie.prototype.set = function(str, value){
  if (!arguments.length) return this;
  if ('string' === typeof str && arguments.length === 2) {
    this.data[str] = value ? value : null;
  }
  else if ('object' === typeof str && arguments.length === 1) {
    extend(this.data, str);
  }
  Cookies.set(this.config.key, encodeURIComponent( JSON2.stringify(this.data) ), this.config.options);
  return this;
};
cookie.prototype.expire = function(){
  Cookies.expire(this.config.key);
  this.data = {};
  return this;
};
cookie.prototype.options = function(obj){
  if (!arguments.length) return this.config.options;
  this.config.options = (typeof obj === 'object') ? obj : {};
  return this;
};
},{"./extend":17,"JSON2":22,"cookies-js":25}],15:[function(require,module,exports){
var JSON2 = require('JSON2');
module.exports = deepExtend;
function deepExtend(target){
  for (var i = 1; i < arguments.length; i++) {
    if (target instanceof Array && arguments[i] instanceof Array) {
      for (var j = 0; j < arguments[i].length; j++) {
        if (target.indexOf(arguments[i][j]) < 0) {
          target.push(arguments[i][j]);
        }
      }
    }
    else {
      for (var prop in arguments[i]){
        if ('undefined' !== typeof target[prop] && 'object' === typeof arguments[i][prop] && arguments[i][prop] !== null) {
          deepExtend(target[prop], clone(arguments[i][prop]));
        }
        else {
          target[prop] = clone(arguments[i][prop]);
        }
      }
    }
  }
  return target;
}
function clone(input){
  return JSON2.parse(JSON2.stringify(input))
}
},{"JSON2":22}],16:[function(require,module,exports){
module.exports = each;
function each(o, cb, s){
  var n;
  if (!o){
    return 0;
  }
  s = !s ? o : s;
  if (o instanceof Array){
    for (n=0; n<o.length; n++) {
      if (cb.call(s, o[n], n, o) === false){
        return 0;
      }
    }
  } else {
    for (n in o){
      if (o.hasOwnProperty(n)) {
        if (cb.call(s, o[n], n, o) === false){
          return 0;
        }
      }
    }
  }
  return 1;
}
},{}],17:[function(require,module,exports){
module.exports = function(target){
  for (var i = 1; i < arguments.length; i++) {
    for (var prop in arguments[i]){
      target[prop] = arguments[i][prop];
    }
  }
  return target;
};
},{}],18:[function(require,module,exports){
function parseParams(str){
  var urlParams = {},
      match,
      pl     = /\+/g, 
      search = /([^&=]+)=?([^&]*)/g,
      decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
      query  = str.split("?")[1];
  while (!!(match=search.exec(query))) {
    urlParams[decode(match[1])] = decode(match[2]);
  }
  return urlParams;
};
module.exports = parseParams;
},{}],19:[function(require,module,exports){
var Emitter = require('component-emitter');
module.exports = queue;
function queue(){
  var self = this;
  if (this instanceof queue === false) {
    return new queue();
  }
  self.capacity = 0;
  self.interval = 0;
  self.config = {
    capacity: 5000,
    interval: 15
  };
  self.events = {
  };
  setInterval(function(){
    self.interval++;
    checkQueue.call(self);
  }, 1000);
  return self;
}
function checkQueue(){
  if ((this.capacity > 0 && this.interval >= this.config.interval)
    || this.capacity >= this.config.capacity) {
      this.emit('flush');
      this.interval = 0;
  }
}
Emitter(queue.prototype);
},{"component-emitter":24}],20:[function(require,module,exports){
module.exports = timer;
function timer(num){
  if (this instanceof timer === false) {
    return new timer(num);
  }
  this.count = num || 0;
  return this;
}
timer.prototype.start = function(){
  var self = this;
  this.pause();
  this.interval = setInterval(function(){
    self.count++;
  }, 1000);
  return this;
};
timer.prototype.pause = function(){
  clearInterval(this.interval);
  return this;
};
timer.prototype.value = function(){
  return this.count;
};
timer.prototype.clear = function(){
  this.count = 0;
  return this;
};
},{}],21:[function(require,module,exports){
/*jslint evil: true, regexp: true */
/*members $ref, apply, call, decycle, hasOwnProperty, length, prototype, push,
    retrocycle, stringify, test, toString
*/
(function (exports) {
if (typeof exports.decycle !== 'function') {
    exports.decycle = function decycle(object) {
        'use strict';
        var objects = [],  
            paths = [];    
        return (function derez(value, path) {
            var i,         
                name,      
                nu;        
            switch (typeof value) {
            case 'object':
                if (!value) {
                    return null;
                }
                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === value) {
                        return {$ref: paths[i]};
                    }
                }
                objects.push(value);
                paths.push(path);
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i], path + '[' + i + ']');
                    }
                } else {
                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name],
                                path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                }
                return nu;
            case 'number':
            case 'string':
            case 'boolean':
                return value;
            }
        }(object, '$'));
    };
}
if (typeof exports.retrocycle !== 'function') {
    exports.retrocycle = function retrocycle($) {
        'use strict';
        var px =
            /^\$(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;
        (function rez(value) {
            var i, item, name, path;
            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}
}) (
  (typeof exports !== 'undefined') ? 
    exports : 
    (window.JSON ? 
      (window.JSON) :
      (window.JSON = {})
    )
);
},{}],22:[function(require,module,exports){
var JSON2 = require('./json2');
var cycle = require('./cycle');
JSON2.decycle = cycle.decycle;
JSON2.retrocycle = cycle.retrocycle;
module.exports = JSON2;
},{"./cycle":21,"./json2":23}],23:[function(require,module,exports){
/*
    json2.js
    2011-10-19
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    See http://www.JSON.org/js.html
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
    This file creates a global JSON object containing two methods: stringify
    and parse.
        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.
            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.
            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.
            This method produces a JSON text from a JavaScript value.
            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value
            For example, this would serialize Dates as ISO strings.
                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        return n < 10 ? '0' + n : n;
                    }
                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };
            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.
            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.
            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.
            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.
            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.
            Example:
            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.
            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.
            Example:
            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });
            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });
    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/
/*jslint evil: true, regexp: true */
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/
(function (JSON) {
    'use strict';
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    /* DDOPSON-2012-04-16 - mutating global prototypes is NOT allowed for a well-behaved module.  
     * It's also unneeded, since Date already defines toJSON() to the same ISOwhatever format below
     * Thus, we skip this logic for the CommonJS case where 'exports' is defined
     */
    if (typeof exports === 'undefined') {
      if (typeof Date.prototype.toJSON !== 'function') {
          Date.prototype.toJSON = function (key) {
              return isFinite(this.valueOf())
                  ? this.getUTCFullYear()     + '-' +
                      f(this.getUTCMonth() + 1) + '-' +
                      f(this.getUTCDate())      + 'T' +
                      f(this.getUTCHours())     + ':' +
                      f(this.getUTCMinutes())   + ':' +
                      f(this.getUTCSeconds())   + 'Z'
                  : null;
          };
      }
      if (typeof String.prototype.toJSON !== 'function') {
        String.prototype.toJSON = function (key) { return this.valueOf(); };
      }
      if (typeof Number.prototype.toJSON !== 'function') {
        Number.prototype.toJSON = function (key) { return this.valueOf(); };
      }
      if (typeof Boolean.prototype.toJSON !== 'function') {
        Boolean.prototype.toJSON = function (key) { return this.valueOf(); };
      }
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {   
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    function str(key, holder) {
        var i,         
            k,         
            v,         
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
})(
  (typeof exports !== 'undefined') ? 
    exports : 
    (window.JSON ? 
      (window.JSON) :
      (window.JSON = {})
    )
);
},{}],24:[function(require,module,exports){
/**
 * Expose `Emitter`.
 */
module.exports = Emitter;
/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */
function Emitter(obj) {
  if (obj) return mixin(obj);
};
/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */
function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}
/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */
Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};
/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */
Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }
  on.fn = fn;
  this.on(event, on);
  return this;
};
/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */
Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};
/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */
Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];
  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }
  return this;
};
/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */
Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};
/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */
Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};
},{}],25:[function(require,module,exports){
/*
},{}]},{},[1])

//# sourceMappingURL=keen-tracking.js.map