#!/bin/sh

# Create and save a simple JavaScript app
echo "<script>document.write(location)</script>" > ./index.html

# Spin up a server to serve it
python -m SimpleHTTPServer 8000 &
APP_PID=$!

# Spin up the rndr server, wait until ready
phantomjs ./server.js &
RNDR_PID=$!
sleep 1

# Pick an app URL to be rendered
URL='http://127.0.0.1:8000/#!/TESTING'

# Get the results rendered by the rndr server
HTML=`curl 127.0.0.1:8001 -s -G --data-urlencode href=$URL`

# Check whether the rendered file contains the random URL
echo $HTML | grep -q $URL
NOT_FOUND=$?

# Spin down, clean up, and exit
rm ./index.html
kill -9 $RNDR_PID
kill -9 $APP_PID
exit $NOT_FOUND
