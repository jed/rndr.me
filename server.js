var system    = require("system")
var webserver = require("webserver")
var webpage   = require("webpage")
var args      = system.args.slice(1)
var argv      = require('minimist')(args, {
  alias: {
    'maxTime': 'max_time',
    'maxBytes': 'max_bytes',
    'readyEvent': 'ready_event',
    'loadImages': 'load_images'
  }
})

var configPath = args.length === 1 ? args[0] : argv.config || "./config.js"
var config     = require(configPath)

for (var a in argv) {
  if (argv[a] === "true" || argv[a] === "false") {
    config[a] = argv[a] === "true"
  } else {
    config[a] = argv[a]
  }
}

if (!config.port) {
  console.error("No port specified in " + configPath)
  phantom.exit(1)
}

var server    = webserver.create()
var listening = server.listen(config.port, onRequest)

if (!listening) {
  console.error("Could not bind to port " + config.port)
  phantom.exit(1)
}

function onRequest(req, res) {
  var page          = webpage.create()
  var bytesConsumed = 0

  if (req.method != "GET") {
    return send(405, toHTML("Method not accepted."))
  }

  var url = parse(req.url)

  if (url.pathname != "/") {
    return send(404, toHTML("Not found."))
  }

  var query = url.query
  var href  = query.href

  if (!href) {
    return send(400, toHTML("`href` parameter is missing."))
  }

  var maxTime    = Number(query.max_time)  || config.maxTime
  var maxBytes   = Number(query.max_bytes) || config.maxBytes
  var readyEvent = query.ready_event       || config.readyEvent
  var loadImages = "load_images" in query  || config.loadImages

  page.settings.loadImages = loadImages

  page.onInitialized = function() {
    page.evaluate(onInit, readyEvent)

    function onInit(readyEvent) {
      window.addEventListener(readyEvent, function() {
        setTimeout(window.callPhantom, 0)
      })
    }
  }

  page.onResourceReceived = function(resource) {
    if (resource.bodySize) bytesConsumed += resource.bodySize

    if (bytesConsumed > maxBytes) {
      send(502, toHTML("More than " + maxBytes + "consumed."))
    }
  }

  page.onCallback = function() {
    send(200, page.content)
  }

  var timeout = setTimeout(page.onCallback, maxTime)

  page.open(href)

  function send(statusCode, data) {
    clearTimeout(timeout)

    res.statusCode = statusCode

    res.setHeader("Content-Type", "text/html")
    res.setHeader("Content-Length", byteLength(data))
    res.setHeader("X-Rndrme-Bytes-Consumed", bytesConsumed.toString())

    res.write(data)
    res.close()

    page.close()
  }
}

function byteLength(str) {
  return encodeURIComponent(str).match(/%..|./g).length
}

function toHTML(message) {
  return "<!DOCTYPE html><body>" + message + "</body>\n"
}

function parse(url) {
  var anchor = document.createElement("a")

  anchor.href = url
  anchor.query = {}

  anchor.search.slice(1).split("&").forEach(function(pair) {
    pair = pair.split("=").map(decodeURIComponent)
    anchor.query[pair[0]] = pair[1]
  })

  return anchor
}
