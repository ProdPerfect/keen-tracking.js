### Known attributes currently collected 
#### a '\*' denotes only available in new data pipeline, not from keen.
#### note that  this will change once we shift over to data pipeline fully. 
#### WIP until data pipeline gets out, but this is what's currently used


* event_type  - self explanatory, the type of event. 
* url.info.protocol - URL protocol, i.e. http, https,
* url.info.domain - Self Explanatory
* url.info.path - Self Explanatory
* url.info.query_string - Self Explanatory
* url.info.anchor - Self Explanatory
* keen.timestamp -  Timestamp at which the event was created client side
* keen.created_at - Technically different from timestamp, since it's when server created the record 
* keen.id - [deprecated w/ data pipeline] - UUID of the event.  Replaced with event_uuid
* event_uuid\* - UUID of the event. 
* user.uuid - our generated UUID of the user. Stored as cookie. 
* visitor.user_id - sometimes provided by client. record-id of the user in their system
* element.name -  self explanatory, when available
* element.title -  self explanatory, when available
* element.text -  self explanatory, when available
* element.node_name -  self explanatory, when available
* element.href -  href, when available.  Must be parsed into protocol,domain,etc later. 
* element.id -  self explanatory, when available
* element.selector-  self explanatory, when available
* session.session_uuid - our generated UUID of user session, stored as a cookie
* tracker_load_uuid  - every time the page reloads, I believe this changes. 
* element.type -  self explanatory, when available
* element.class-  self explanatory, when available
* page.time_on_page - when available, how long has user been on page before this interaction
* page.description - page description (meta element, pretty much always available)
* page.title - pretty much always available 
* form.action - loosely, the URL to which a form gets submitted. must be parsed.
* form.fields - what fields were sent in the form submission
* form.method - POST, GET, etc. What you'd expect.
* time - time of event. has nested attributes below. This is not used
* tech.profile - tech information such as screen width, dimensions, user agent, etc. 
* time.utc.year
* time.utc.month
* time.utc.week
* time.utc.day_of_month
* time.utc.day_of_week
* time.utc.day_of_year
* time.utc.quater_of_year
* time.utc.day_of_week_string
* time.utc.hour
* time.utc.minute
* time.utc.second
* time.utc.millisecond
* time.utc.timezone_offset
* geo - deprecated, we no longer collect geoip
* geo.city - deprecated, we no longer collect geoip. 


#### Other

- Clients are able to send over arbitrary data. 
- Soon, "cursor type" will be added, which allows us to identify clickable elements more easily than our current system.
