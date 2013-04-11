#!/bin/sh

phantomjs ./server.js 8000 &
PHANTOM_PID=$!

python -m SimpleHTTPServer 8001 &
STATIC_PID=$!

sleep 1

curl localhost:8000 -G -s --data-urlencode 'href=http://localhost:8001/test/#!/1' | grep -q "<body>Page one</body>"

NOT_FOUND=$?

kill -9 $PHANTOM_PID
kill -9 $STATIC_PID

exit $NOT_FOUND
