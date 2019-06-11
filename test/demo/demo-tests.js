const demoTests = (Keen) => {
  const demoConfig = {
    host: 'wilson.datapipe.prodperfect.com/v1',
    projectId: '5b2939e7c9e77c00012dff97',
    readKey: 'YOUR_READ_KEY',
    writeKey: '060270145B86166EFEACA8D50526B8A211A187932B839730187351A12591E4426F976AF08458CDF2315CE4AA543BEF8464FF2785A6F5B03715F104982EBAEFB5F47168DB8A0AB508C985D63B7FA9D8B7622109D65918EE151224FD24EB179ABC',
    requestType: 'beacon',
  };

  Keen.debug = true; //eslint-disable-line

  const client = new Keen(demoConfig);

  const options = {
    ignoreDisabledFormFields: false,
    ignoreFormFieldTypes: [],
    recordClicks: true,
    recordFormSubmits: true,
    recordInputChanges: true,
    test_name: 'recording-lib-demo',
    test_id: 'recording-lib-demo',
    recordPageViews: true,
    recordPageUnloads: true,
    redactTextContent: false,
    recordScrollState: true,
  };
  client.initAutoTracking(options);

  const x = Math.random();
  const eventBody = {
    x: 123456,
    page: {
      a: 1,
      b: {
        c:1
      }
    }
  };


  client.recordEvent({
    collection: 'abc',
    event: {
      z: 1
    },
    requestType: 'beacon',
    callback: (err, res) => console.log(err,res)
  });


/*
.then(res=>{
  console.log(res);
}).catch(err => conrole.log(err));


  client
    .recordEvent('recordEvent', { z : 1}, function(err, res){
      console.log('with callback');
      if (err) {
        console.log('err', err);
      } else {
        Keen.log('#recordEvent');
        Keen.log(res);
      }
    });


  client.recordEvents({
    col1: [{
      some: 1
    }],
    col2: [{
      some: 1
    }]
  }, (err, res) => {
    console.log(err,res);
  });


*/

  return;


client.recordEvents({
  col1: [{
    some: 1
  }],
  col2: [{
    some: 1
  }]
}).then(res => {
  console.log(res);
});
return;
function save(id){
  client
    .recordEvent({
      collection: 'unique_clicks',
      event: {
        some_key: 'some_value',
        // ...
      },
      unique: true, // check if the event is unique, before sending to API
      cache: {
    //    storage: 'indexeddb', // for persistence. Remove this property to use RAM
    maxAge: 1000 * 3
      }
    })
    .then((response) => {
      console.log('ok', response);
    })
    .catch(someError => {
      console.log('error', someError);
    });
}
save(1);
save(2);
setTimeout(() => save(3), 6000);

return;
setInterval(() => {
  eventBody.z=Math.random();
  save();
}, 2000);
setTimeout(() => {
  save();
}, 5000);

return;

  client
    .recordEvent('recordEvent', { z : 1}, function(err, res){
      console.log('with callback');
      if (err) {
        console.log('err', err);
      } else {
        Keen.log('#recordEvent');
        Keen.log(res);
      }
    });
return;

  client
    .recordEvent('recordEvent', eventBody)
    .then((res) => {
      console.log('with promise');
      Keen.log('#recordEvent');
      Keen.log(res);
      console.log('ok');
    })
    .catch(some => {
      console.log('failed',some);
    });

return;
    client
      .recordEvent('recordEvent', eventBody)
      .then((res) => {
        console.log('with promise');
        Keen.log('#recordEvent');
        Keen.log(res);
        console.log('ok');
      })
      .catch(some => {
        console.log('failed',some);
      });

  return;


  client
    .recordEvent('recordEvent', eventBody, function(err, res){
      console.log('with callback');
      if (err) {
        console.log('err', err);
      } else {
        Keen.log('#recordEvent');
        Keen.log(res);
      }
    })
    .then((res) => {
      console.log('with promise');
      Keen.log('#recordEvent');
      Keen.log(res);
      console.log('ok');
    })
    .catch(some => {
      console.log('failed',some);
    });

  client.recordEvents({ 'recordEvents': [eventBody, eventBody, eventBody] }, function(err, res){
    console.log('with callback');
    if (err) {
      console.log('err', err);
    } else {
      Keen.log('#recordEvents');
      Keen.log(res);
    }
  })
  .then((res) => {
    console.log('with promise');
    Keen.log('#recordEvents');
    Keen.log(res);
    console.log('ok');
  })
  .catch(err => {
    console.log('failed', err);
  });
  /*  */
}

if (typeof window !== 'undefined') {
  window.demoTests = demoTests;
}
if (typeof global !== 'undefined') {
  module.exports = demoTests;
}
