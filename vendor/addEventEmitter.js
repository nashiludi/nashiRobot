const fs = require('fs');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);

module.exports = function addEventEmitter (subject) {
	const eventFiles = fs.readdirSync(`${appDir}/events`).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const event = require(`${appDir}/events/${file}`);
		if (event.once) {
			subject.once(event.name, (...args) => event.execute(...args));
		} else {
			subject.on(event.name, (...args) => event.execute(...args));
		}
	}
}
