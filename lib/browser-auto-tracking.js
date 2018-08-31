import pkg from '../package.json';

export function initAutoTrackingCore(lib) {
  return function(obj = {}) {
    const client = this;
    const helpers = lib.helpers;
    const utils = lib.utils;

    const options = utils.extend({
      ignoreDisabledFormFields: false,
      ignoreFormFieldTypes: ['password'],
      recordClicks: true,
      recordFormSubmits: true,
      recordInputChanges: false,
      recordPageUnloads: false,
      recordPageViews: true,
      recordPageViewsOnExit: false,
      recordScrollState: true,
      shareUuidAcrossDomains: false,
      collectIpAddress: true,
      collectUuid: true,
      catchError: undefined // optional, function(someError) - error handler
    }, obj);

    const defaultDomElementOptions = {
      recordTextContent: true,
      redactTextContent: true
    }

    options.domElementOptions = utils.extend(defaultDomElementOptions, obj.domElementOptions);

    if (client.config.requestType === 'beaconAPI' && options.catchError) {
      throw `You cannot use the BeaconAPI and catchError function in the same time, because BeaconAPI ignores errors. For requests with error handling - use requestType: 'fetch'`;
      return;
    }

    if (
      client.config.requestType === 'jsonp' // jsonp is deprecated, it's the default value from old keen's client
    ) {
      if (options.catchError) {
        client.config.requestType = 'fetch';
      } else {
        client.config.requestType = 'beaconAPI';
      }
    }

    const session_cookie = new utils.cookie('prodperfect_session');
    let session_uuid = session_cookie.get('session_uuid');
    if (!session_uuid) {
      session_uuid = helpers.getUniqueId();
    }
    session_cookie.set('session_uuid', session_uuid);
    session_cookie.expire(1/48);

    const prodperfectTestData = new utils.cookie('prodperfect_test').get('test_run_data');

    const now = new Date();
    const cookie = new utils.cookie('keen');

    const domainName = helpers.getDomainName(window.location.hostname);
    const cookieDomain = domainName && options.shareUuidAcrossDomains ? {
      domain: '.' + domainName
    } : {};

    let uuid;
    if (options.collectUuid) {
      uuid = cookie.get('uuid');
      if (!uuid) {
        uuid = helpers.getUniqueId();
        cookie.set('uuid', uuid, cookieDomain);
      }
    }

    let initialReferrer = cookie.get('initialReferrer');
    if (!initialReferrer){
      initialReferrer = document && document.referrer || undefined;
      cookie.set('initialReferrer', initialReferrer, cookieDomain);
    }

    let scrollState = {};
    if (options.recordScrollState) {
      scrollState = helpers.getScrollState();
      utils.listener('window').on('scroll', () => {
        scrollState = helpers.getScrollState(scrollState);
      });
    }

    const tracker_loaded_at_time = now.toISOString();
    const tracker_load_uuid_value = helpers.getUniqueId();

    const addons = [
      {
        name: 'keen:ua_parser',
        input: {
          ua_string: 'user_agent'
        },
        output: 'tech'
      },
      {
        name: 'keen:url_parser',
        input: {
          url: 'url.full'
        },
        output: 'url.info'
      },
      {
        name: 'keen:url_parser',
        input: {
          url: 'referrer.full'
        },
        output: 'referrer.info'
      },
      {
        name: 'keen:date_time_parser',
        input: {
          date_time: 'keen.timestamp'
        },
        output: 'time.utc'
      },
      {
        name: 'keen:date_time_parser',
        input: {
          date_time: 'local_time_full'
        },
        output: 'time.local'
      }
    ];

    let ip_address = '${keen.ip}';
    addons.push({
      name: 'keen:ip_to_geo',
      input: {
        ip: 'ip_address',
        remove_ip_property: !options.collectIpAddress
      },
      output : 'geo'
    });

    client.extendEvents(function() {
      const browserProfile = helpers.getBrowserProfile();
      return {
        event_uuid:  helpers.getUniqueId(),
        iso_time_full: new Date().toISOString(),
        local_time_full: new Date().toString(),
        session: {
          session_uuid: session_uuid
        },
        tracked_by: pkg.name + '-' + pkg.version,
        tracker_load_uuid: tracker_load_uuid_value,
        tracker_loaded_at: tracker_loaded_at_time,
        prodperfect_test_data: prodperfectTestData,
        user: {
          uuid
        },
        page: {
          title: document ? document.title : null,
          description: browserProfile.description,
          scroll_state: scrollState,
          time_on_page: getSecondsSinceDate(now),
          time_on_page_ms: getMiliSecondsSinceDate(now)
        },

        ip_address,
        geo: { /* Enriched */ },

        user_agent: '${keen.user_agent}',
        tech: {
          profile: browserProfile
          /* Enriched */
        },

        url: {
          full: window ? window.location.href : '',
          info: { /* Enriched */ }
        },

        referrer: {
          initial: initialReferrer,
          full: document ? document.referrer : '',
          info: { /* Enriched */ }
        },

        time: {
          local: { /* Enriched */ },
          utc: { /* Enriched */ }
        },

        keen: {
          timestamp: new Date().toISOString(),
          addons,
        }
      };
    });

    if (options.recordClicks === true) {
      utils.listener('*').on('click', function(e) {
        const el = e.target;
        const event = {
          element: helpers.getDomNodeProfile(el, options.domElementOptions)
        };

        if (options.catchError) {
          return client
            .recordEvent({
              collection: 'clicks',
              event
            }).catch(err => {
              options.catchError(err);
            });
        }

        return client
          .recordEvent({
            collection: 'clicks',
            event
          });
      });
    }

    if (options.recordFormSubmits === true) {
      utils.listener('form').on('submit', function(e) {
        const el = e.target;
        const serializerOptions = {
          disabled: options.ignoreDisabledFormFields,
          ignoreTypes: options.ignoreFormFieldTypes
        };
        const fields = utils.serializeForm(el, serializerOptions);
        const keys = Object.keys(fields);
        for (let x = 0; x < keys.length; x++) {
          fields[keys[x]] = '---REDACTED---';
        }
        const event = {
          form: {
            action: el.action,
            fields: fields,
            method: el.method
          },
          element: helpers.getDomNodeProfile(el, options.domElementOptions)
        };

        if (options.catchError) {
          return client
            .recordEvent({
              collection: 'form_submissions',
              event
            })
            .catch(err => {
              options.catchError(err);
            });
        }

        return client.recordEvent({
          collection: 'form_submissions',
          event
        });
      });
    }

    if (options.recordInputChanges === true) {
      utils.listener('*').on('change', function (e) {
        var el = e.target;
        var props = {
          element: helpers.getDomNodeProfile(el, options.domElementOptions),
          page: {
            scroll_state: helpers.getScrollState
          }
        };
        client.recordEvent('changes', props);
      });
    }

    if (options.recordPageUnloads === true && window.addEventListener) {
      window.addEventListener('beforeunload', function (e) {
        client.recordEvent('pageunloads');
      }, false);
    }

    if (options.recordPageViews === true && !options.recordPageViewsOnExit) {
      if (options.catchError) {
        client
          .recordEvent({
            collection: 'pageviews'
          })
          .catch(err => {
            options.catchError(err);
          });
      } else {
        client
          .recordEvent({
            collection: 'pageviews'
          });
      }
    }

    if (options.recordPageViewsOnExit && typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        client.config.requestType = 'beaconAPI'; // you can run beforeunload only with beaconAPI
        client.recordEvent({
          collection: 'pageviews'
        });
      });
    }

    return client;
  };
}

function getSecondsSinceDate(date) {
  return Math.round(getMiliSecondsSinceDate(date) / 1000);
}

function getMiliSecondsSinceDate(date) {
  return new Date().getTime() - date.getTime();
}
