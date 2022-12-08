/**
 * name : configs/mongodb
 * author : Aman
 * Date : 04-Nov-2021
 * Description : Mongodb connections configurations
 */

//dependencies
let mongoose = require('mongoose')
const mongoose_autopopulate = require('mongoose-autopopulate')
const mongoose_timestamp = require('mongoose-timestamp')
const { logger } = require('@log/logger')
module.exports = function () {
	// Added to remove depreciation warnings from logs.
	// mongoose.set('useCreateIndex', true) // Default is true in mongoose v6
	// mongoose.set('useFindAndModify', false) // Default is false in mongoose v6
	// mongoose.set('useUnifiedTopology', true) // Default is true in mongoose v6

	var db = mongoose.createConnection(process.env.MONGODB_URL, {
		useNewUrlParser: true,
	})

	db.on('error', function () {
		logger.info('connection error:')
	})

	db.once('open', function () {
		logger.info('Connected to DB')
	})

	mongoose.plugin(mongoose_timestamp, {
		createdAt: 'createdAt',
		updatedAt: 'updatedAt',
	})

	mongoose.plugin(mongoose_autopopulate)
	global.db = db
}
