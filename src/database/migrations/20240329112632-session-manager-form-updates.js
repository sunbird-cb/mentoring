'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}

		await queryInterface.bulkUpdate(
			'forms',
			{
				data: JSON.stringify({
					fields: {
						controls: [
							{
								name: 'title',
								label: 'Session title',
								value: '',
								class: 'ion-no-margin',
								type: 'text',
								placeHolder: 'Ex. Name of your session',
								position: 'floating',
								errorMessage: {
									required: 'Enter session title',
								},
								validators: {
									required: true,
									maxLength: 255,
									pattern: '^(?!.*(?:\b|onS+|s*=|javascript:|<|/|[^/>][^>]+|/[^>][^>]+)>).+$',
								},
							},
							{
								name: 'description',
								label: 'Description',
								value: '',
								class: 'ion-no-margin',
								type: 'textarea',
								placeHolder: 'Tell the community something about your session',
								position: 'floating',
								errorMessage: {
									required: 'Enter description',
								},
								validators: {
									required: true,
									maxLength: 255,
								},
							},
							{
								name: 'type',
								label: 'Session type',
								class: 'ion-no-margin',
								type: 'select',
								dependedChild: 'mentees',
								value: '',
								position: 'floating',
								info: [
									{
										header: 'Public session',
										message: 'Discoverable. Mentees can enroll and attend',
									},
									{
										header: 'Private session',
										message: 'Non-discoverable. Invited mentee can attend',
									},
								],
								errorMessage: {
									required: 'Please select your session type',
								},
								validators: {
									required: true,
								},
								meta: {
									errorLabel: 'Location',
									disabledChildren: ['mentees', 'mentor_id'],
								},
								multiple: false,
								options: [
									{
										label: 'Private',
										value: 'PRIVATE',
									},
									{
										label: 'Public',
										value: 'PUBLIC',
									},
								],
							},
							{
								name: 'mentor_id',
								label: 'Add mentor',
								value: '',
								class: 'ion-no-margin',
								type: 'search',
								position: 'floating',
								disabled: true,
								meta: {
									multiSelect: false,
									disableIfSelected: true,
									searchLabel: 'Search for mentor',
									searchData: [],
									url: 'MENTORS_LIST',
									labelArrayForSingleSelect: ['mentor_name', 'organization.name'],
									filters: {
										entity_types: [
											{
												key: 'designation',
												label: 'Designation',
												type: 'checkbox',
											},
										],
										organizations: [
											{
												isEnabled: true,
												key: 'organizations',
												type: 'checkbox',
											},
										],
									},
									filterType: 'mentor',
								},
								info: [
									{
										message: 'Click to select Mentor for this session',
									},
								],
								errorMessage: {
									required: 'Please add a mentor for the session',
								},
								validators: {
									required: true,
								},
							},
							{
								name: 'mentees',
								label: 'Add mentee',
								value: [],
								class: 'ion-no-margin',
								disabled: true,
								type: 'search',
								meta: {
									multiSelect: true,
									url: 'MENTEES_LIST',
									searchLabel: 'Search for mentee',
									searchData: [],
									maxCount: 'MAX_MENTEE_ENROLLMENT_COUNT',
									labelForListButton: 'View Mentee List',
									labelForAddButton: 'Add New Mentee',
									filters: {
										entity_types: [
											{
												key: 'designation',
												label: 'Designation',
												type: 'checkbox',
											},
										],
										organizations: [
											{
												isEnabled: true,
												key: 'organizations',
												type: 'checkbox',
											},
										],
									},
									filterType: 'mentee',
								},
								position: 'floating',
								info: [
									{
										message: 'Click to select Mentee(s) for this session',
									},
								],
								errorMessage: {
									required: 'Please add mentee for the session',
								},
								validators: {
									required: true,
								},
							},
							{
								name: 'start_date',
								label: 'Start date',
								class: 'ion-no-margin',
								value: '',
								displayFormat: 'DD/MMM/YYYY HH:mm',
								dependedChild: 'end_date',
								type: 'date',
								placeHolder: 'YYYY-MM-DD hh:mm',
								errorMessage: {
									required: 'Enter start date',
								},
								position: 'floating',
								validators: {
									required: true,
								},
							},
							{
								name: 'end_date',
								label: 'End date',
								class: 'ion-no-margin',
								position: 'floating',
								value: '',
								displayFormat: 'DD/MMM/YYYY HH:mm',
								dependedParent: 'start_date',
								type: 'date',
								placeHolder: 'YYYY-MM-DD hh:mm',
								errorMessage: {
									required: 'Enter end date',
								},
								validators: {
									required: true,
								},
							},
							{
								name: 'recommended_for',
								label: 'Recommended for',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: {
									required: 'Enter recommended for',
								},
								validators: {
									required: true,
								},
								options: [
									{
										label: 'Block education officer',
										value: 'beo',
									},
									{
										label: 'Cluster officials',
										value: 'co',
									},
									{
										label: 'District education officer',
										value: 'deo',
									},
									{
										label: 'Head master',
										value: 'hm',
									},
									{
										label: 'Teacher',
										value: 'te',
									},
								],
								meta: {
									entityType: 'recommended_for',
									addNewPopupHeader: 'Recommended for',
									addNewPopupSubHeader: 'Who is this session for?',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
							{
								name: 'categories',
								label: 'Categories',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: {
									required: 'Enter categories',
								},
								validators: {
									required: true,
								},
								options: [
									{
										label: 'Communication',
										value: 'communication',
									},
									{
										label: 'Educational leadership',
										value: 'educational_leadership',
									},
									{
										label: 'Professional development',
										value: 'professional_development',
									},
									{
										label: 'School process',
										value: 'school_process',
									},
									{
										label: 'SQAA',
										value: 'sqaa',
									},
								],
								meta: {
									entityType: 'categories',
									addNewPopupHeader: 'Add a new category',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
							{
								name: 'medium',
								label: 'Select medium',
								alertLabel: 'medium',
								class: 'ion-no-margin',
								value: '',
								type: 'chip',
								position: '',
								disabled: false,
								errorMessage: {
									required: 'Enter select medium',
								},
								validators: {
									required: true,
								},
								options: [
									{
										label: 'English',
										value: 'en_in',
									},
									{
										label: 'Hindi',
										value: 'hi',
									},
								],
								meta: {
									entityType: 'medium',
									addNewPopupHeader: 'Add new language',
									showSelectAll: true,
									showAddOption: true,
								},
								multiple: true,
							},
						],
					},
					template_name: 'defaultTemplate',
				}),

				updated_at: new Date(),
			},
			{ type: 'platformApp', sub_type: 'platformAppForm', organization_id: defaultOrgId }
		)
	},

	down: async (queryInterface, Sequelize) => {
		const defaultOrgId = queryInterface.sequelize.options.defaultOrgId
		if (!defaultOrgId) {
			throw new Error('Default org ID is undefined. Please make sure it is set in sequelize options.')
		}
		await queryInterface.bulkUpdate(
			'forms',

			{
				data: JSON.stringify({
					fields: {
						forms: [
							{
								name: 'Google meet',
								hint: 'To use google meet for your meeting, schedule a meeting on google meet and add meeting link below.',
								value: 'Gmeet',
								form: {
									controls: [
										{
											name: 'link',
											label: 'Meet link',
											value: '',
											type: 'text',
											platformPlaceHolder: 'Eg: https://meet.google.com/xxx-xxxx-xxx',
											errorMessage: {
												required: 'Please provide a meet link',
												pattern: 'Please provide a valid meet link',
											},
											validators: {
												required: true,
												pattern: '^https://meet.google.com/[a-z0-9-]+$',
											},
										},
									],
								},
							},
							{
								name: 'Zoom',
								hint: 'To use zoom for your meeting, schedule a meeting on zoom and add meeting details below.',
								value: 'Zoom',
								form: {
									controls: [
										{
											name: 'link',
											label: 'Zoom link',
											value: '',
											class: 'ion-no-margin',
											type: 'text',
											platformPlaceHolder: 'Eg: https://us05web.zoom.us/j/xxxxxxxxxx',
											position: 'floating',
											errorMessage: {
												required: 'Please provide a meeting link',
												pattern: 'Please provide a valid meeting link',
											},
											validators: {
												required: true,
												pattern:
													'^https?://(?:[a-z0-9-.]+)?zoom.(?:us|com.cn)/(?:j|my)/[0-9a-zA-Z?=.]+$',
											},
										},
										{
											name: 'meetingId',
											label: 'Meeting ID',
											value: '',
											class: 'ion-no-margin',
											type: 'number',
											platformPlaceHolder: 'Eg: 123 456 7890',
											position: 'floating',
											errorMessage: {
												required: 'Please provide a meeting ID',
											},
											validators: {
												required: true,
												maxLength: 11,
											},
										},
										{
											name: 'password',
											label: 'Passcode',
											value: '',
											type: 'text',
											platformPlaceHolder: 'Eg: aBc1de',
											errorMessage: {
												required: 'Please provide a valid passcode',
											},
											validators: {
												required: true,
											},
										},
									],
								},
							},
							{
								name: 'WhatsApp',
								hint: 'To use whatsapp for your meeting(32 people or less, create a call link on WhatsApp and add a link below.)',
								value: 'Whatsapp',
								form: {
									controls: [
										{
											name: 'link',
											label: 'WhatsApp',
											value: '',
											type: 'text',
											platformPlaceHolder: 'Eg: https://call.whatsapp.com/voice/xxxxxxxxxxxx',
											errorMessage: {
												required: 'Please provide a WhatsApp link.',
												pattern: 'Please provide a valid WhatsApp link.',
											},
											validators: {
												required: true,
												pattern:
													'^https?://(?:[a-z0-9-.]+)?whatsapp.com/[voicedeo]+/[0-9a-zA-Z?=./]+$',
											},
										},
									],
								},
							},
						],
					},
					template_name: 'defaultTemplate',
				}),

				updated_at: new Date(),
			},

			{ type: 'platformApp', sub_type: 'platformAppForm', organization_id: defaultOrgId }
		)
	},
}
