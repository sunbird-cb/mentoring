const { log } = require('elevate-logger')
let config = log.config('info', 'ment', false)
module.exports = () => {
	config
}
