rndr
====

[![Build Status](https://travis-ci.org/jed/rndr.png?branch=master)](https://travis-ci.org/jed/rndr)

rndr is a tiny http server that eats urls poops html. Every incoming url is evaluated in a headless browser window, outputting the HTML of the resulting DOM.

Installation
------------

1. [Install PhantomJS](http://phantomjs.org/download.html).
2. Download [server.js](https://github.com/jed/rndr/blob/master/server.js) from this repo.

Example
-------

from [test.js](https://github.com/jed/rndr/blob/master/test.js):

```bash
#!/bin/sh

# Create and save a simple JavaScript app
echo "<script>document.write(location)</script>" > ./before.html

# Spin up a server to serve it
python -m SimpleHTTPServer 8000 &
APP_PID=$!

# Spin up the rndr server, wait until ready
phantomjs ./server.js 8001 &
RNDR_PID=$!
sleep 1

# Pick a random app URL
URL='http://127.0.0.1:8000/before.html#!/'$RANDOM

# Save the results rendered by the rndr server
curl :8001 -sG --data-urlencode href=$URL > ./after.html

# Check whether the rendered file contains the random URL
grep -q $URL ./after.html
NOT_FOUND=$?

# Spin down, clean up, and exit
rm ./before.html
rm ./after.html
kill -9 $RNDR_PID
kill -9 $APP_PID
exit $NOT_FOUND
```

API
---

To spin up the server, run the following from the command line:

    phantomjs ./server.js <port-number>

Note that `port-number` is optional, and if omitted will default to the `PORT` environment variable, or `80` if none exists.

The server exposes a single root endpoint at `/`. It returned generated HTML based on the following parameters:

- `href`: Required. This is the url to be rendered.
- `max_time`: The maximum number of milliseconds until render. Any windows not already rendered by event will be rendered once this elapses. This is optional, and `30000` by default (30 seconds).
- `max_bytes`: The maximum number of incoming bytes. Any windows that load more than this value will return an error without rendering. This is optional, and `1048576` by default (1 MiB).
- `load_images`: This can be specified to any value to load document images. This is optional, and omitted by default.
- `ready_event`: This is the name of the `window` event that triggers render. This is optional, and `load` by default. To specify when rendering occurs, such as when the DOM is not ready to be rendered until after `window.onload`, trigger a DOM event manually as follows:

```javascript
jQuery.getJSON("http://api.myapp.com", function(data) {
  myCustomRenderingCallback(data)

  var readyEvent = document.createEvent("Event")
  readyEvent.initEvent("renderReady", true, true)
  window.dispatchEvent(readyEvent)
})
```
