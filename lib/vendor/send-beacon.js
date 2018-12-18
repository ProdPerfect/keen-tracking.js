const isString = val => typeof val === 'string';
const isBlob = val => val instanceof Blob;

export default function sendBeacon(url, data) {
  if (!! window.navigator.sendBeacon) {
    return window.navigator.sendBeacon(url, data);
  } else {
    return polyfillSendBeacon.call(window, url, data);
  }

}

// Begin `sendBeacon` from navigator.sendBeacon package
function polyfillSendBeacon(url, data) {
  const event = this.event && this.event.type;
  const sync = event === 'unload' || event === 'beforeunload';

  const xhr = ('XMLHttpRequest' in this) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  xhr.open('POST', url, !sync);
  xhr.withCredentials = true;
  xhr.setRequestHeader('Accept', '*/*');


  if (isString(data)) {
    xhr.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
    xhr.responseType = 'text/plain';
  } else if (isBlob(data) && data.type) {
    xhr.setRequestHeader('Content-Type', data.type);
  }

  try {
    xhr.send(data);
  } catch (error) {
    return false;
  }

  return true;
}
// End `sendBeacon` from navigator.sendBeacon package
