const fs = require('fs');

const config = {
	'token': 'your-token-here',
	'clientId': 'your-client-id',
};

fs.access('config.json', fs.constants.F_OK, (err) => {
	if (err) {
		fs.writeFile('config.json', JSON.stringify(config, null, 2), (err) => {
			if (err) throw err;
			console.log('The file "config.json" has been created!');
		});
	}
	else {
		console.log('The file "config.json" already exists, no action required.');
	}
});