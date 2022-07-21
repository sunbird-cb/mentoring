describe('Entity api test.', () => {
	const mongoose = require('mongoose')

	async function loadMongo() {
		let db = await mongoose.connect(global.__MONGO_URI__ + global.mongoDBName, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		global.db = db
		return
	}

	describe('Create and update entity test', () => {
		let entitiesData

		beforeAll(async () => {
			await loadMongo()
			entitiesData = require('@db/entities/query')

			return
		})

		test('Should return true on create', async () => {
			const bodyData = {
				value: 'sqaa',
				label: 'SQAA',
				type: 'categories',
				image: 'entity/SQAA.jpg',
				createdBy: '62d00b7c082b1ebc88a2a095',
				updatedBy: '62d00b7c082b1ebc88a2a095',
			}

			const actualResponse = await entitiesData.createEntity(bodyData)

			expect(actualResponse).toEqual(true)
		})

		test('Should return error', async () => {
			let _id = '62d00b7c082b1ebc88a2a095'
			const bodyData = {
				value: 'sqaa',
				label: 'SQAA',
				type: 'categories',
				image: 'entity/SQAA.jpg',
				createdBy: '62d00b7c082b1ebc88a2a095',
				updatedBy: '62d00b7c082b1ebc88a2a095',
				updatedBy: _id,
				updatedAt: new Date().getTime(),
			}

			const actualResponse = await entitiesData.updateOneEntity(_id, bodyData)
			expect(actualResponse).toEqual('ENTITY_NOT_FOUND')
		})

		afterAll(async () => {
			try {
				mongoose.connection.close()
			} catch (error) {
				console.log(`
            You did something wrong
            ${error}
          `)
				throw error
			}
		})
	})
})
