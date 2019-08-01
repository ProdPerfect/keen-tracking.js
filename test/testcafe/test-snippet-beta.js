!function(name,path,ctx){
  var latest,prev=name!=='Keen'&&window.Keen?window.Keen:false;ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;latest=w.Keen;if(prev){w.Keen=prev}else{try{delete w.Keen}catch(e){w.Keen=void 0}}ctx[name]=latest;ctx[name].ready(fn)};s.async=1;s.src=path;h.parentNode.appendChild(s)}}
}('ProdPerfectKeen','https://test.trackinglibrary.prodperfect.com/keen-tracking_beta.min.js',this);

ProdPerfectKeen.ready(function() {

  var client = new ProdPerfectKeen({
    projectId: '5a3188a2c9e77c000154bef7',
    writeKey: 'D88D34AB1044DCF5DDCE2FB79C72241ACFD783DF5FE347F8352A03D88ADBA00BC047F42B3C38010BD7B5E67CAE23557CA8A6B246B29F6EB22B77FC74FE13408CAC5FD60B2E4EB4E747F60A2DFFCB0BF54DAB602FF5093CD26804FFBB3CDB7007',
    requestType: 'beacon',
    host: 'test.datapipe.prodperfect.com/v1'
  });
  client.extendEvents({
    visitor: {
      user_id: null
    }
  });

  var options = {
    ignoreDisabledFormFields: false,
    ignoreFormFieldTypes: ['password', 'email'],
    recordClicks: true,
    recordFormSubmits: true,
    recordInputChanges: true,
    recordPageViews: true,
    recordPageUnloads: true,
    recordScrollState: true
    };
  client.initAutoTracking(options);
});
