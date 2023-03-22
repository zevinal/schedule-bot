# Schedule bot for Discord

A Discord bot to help schedule events.

## Setup

This bot will help you schedule an event in Discord and allow users to react to a message to be notified in DM one hour prior to the event.

1. Open the  [Discord developer portal](https://discordapp.com/developers/applications/)
2. Create a new application.
3. Click on the "Bot" tab on the left and then "Add Bot" on the right.
4. Copy your bot's token and save it for later.
5. Make sure you enable `Message Content Intent`.
6. In the "OAuth2" tab on the left, go to the URL Generator, add the "bot" and "applications.commands" scopes, and invite the bot to your server.

### Setting up the bot

1. Install [Node.js 16.9.0 or newer](https://nodejs.org/en/download/).
2. Download this repository using git.
	```cmd
	git clone https://github.com/zevinal/schedule-bot.git
	```
3. Open a terminal in the `schedule-bot` folder.
	```sh
	# NPM install non-development packages
	npm ci
	# Create the config.
	npm run build
	```
4. A new file will be created in the project folder called `config.json`. Take the bot token you saved earlier and paste it in to the token field. Paste your bot's client id in the client id field. You can get this from the "General Information" tab under `Application ID`.
5. Now we need to register the slash commands, you can remove any of the commands you want from /commands/ if necessary.
	```sh
	# Registering the slash commands
	npm run register
	# Start the bot and create an event!
	npm start
	```