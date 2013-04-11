#!/bin/sh

phantomjs ./server.js 8000 &
PHANTOM_PID=$!

python -m SimpleHTTPServer 8001 &
STATIC_PID=$!

sleep 1

RENDERED_HTML=`curl localhost:8000 -G -s --data-urlencode 'href=http://localhost:8001/#!/1'`

kill -9 $PHANTOM_PID
kill -9 $STATIC_PID

if [[ "$RENDERED_HTML" =~ "<body>Page one</body>" ]]
then
    exit 0
else
    exit 1
fi
