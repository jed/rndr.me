var system = require("system")

// 8001
exports.port = system.env.PORT || 8001

// 30 seconds
exports.maxTime = 30000

// 1 MiB
exports.maxBytes = 0x100000

// window.onload
exports.readyEvent = "load"

// don't load images
exports.loadImages = false
