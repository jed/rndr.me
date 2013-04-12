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
