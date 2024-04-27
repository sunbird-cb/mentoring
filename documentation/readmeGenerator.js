const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

rl.question('Enter the version of the documentation (leave blank for latest): ', (input) => {
	const version = input.trim() || 'latest'
	const templatePath = './README-Template.md'
	const dockerComposePath = `./${version}/dockerized/MentorEd-Setup-README.md`
	const pm2Path = `./${version}/native/MentorEd-Setup-README.md`

	fs.readFile(templatePath, 'utf8', (err, data) => {
		if (err) {
			console.error(`Failed to read the template markdown file: ${err.message}`)
			return rl.close()
		}

		let updatedMarkdown = data

		fs.readFile(dockerComposePath, 'utf8', (err, dockerContent) => {
			if (err) {
				console.error(`Failed to read Docker Compose documentation: ${err.message}`)
				return rl.close()
			}

			updatedMarkdown = updatedMarkdown.replace('{{DOCKER_COMPOSE_DOCUMENTATION}}', dockerContent)

			fs.readFile(pm2Path, 'utf8', (err, pm2Content) => {
				if (err) {
					console.error(`Failed to read PM2 documentation: ${err.message}`)
					return rl.close()
				}

				updatedMarkdown = updatedMarkdown.replace('{{PM2_DOCUMENTATION}}', pm2Content)

				const outputFilename = version === 'latest' ? 'README.md' : `README-${version}.md`

				fs.writeFile(outputFilename, updatedMarkdown, 'utf8', (err) => {
					if (err) {
						console.error(`Failed to write the updated README file: ${err.message}`)
					} else {
						console.log(`Updated README successfully written to ${outputFilename}`)
					}
					rl.close()
				})
			})
		})
	})
})
