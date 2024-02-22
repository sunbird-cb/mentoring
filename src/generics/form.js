const formQueries = require('../database/queries/form')
// const utils = require('@generics/utils')
async function getAllFormsVersion() {
	try {
		// let form = (await utils.internalGet('formVersion')) || false
		// if (!form) {
		// 	form = await formQueries.findAllTypeFormVersion()
		// 	await utils.internalSet('formVersion', form)
		// }
		// return form
		const form = await formQueries.findAllTypeFormVersion()
		return form
	} catch (error) {
		console.error(error)
	}
}
module.exports = { getAllFormsVersion }
