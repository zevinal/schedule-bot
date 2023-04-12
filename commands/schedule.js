const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chrono = require('chrono-node');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const scheduleFile = path.join(__dirname, '../schedule.json');
let schedule = [];
try {
	const data = fs.readFileSync(scheduleFile, 'utf-8');
	schedule = JSON.parse(data);
	console.log(typeof schedule, schedule);
	if (typeof schedule !== 'object' || Array.isArray(schedule)) {
		schedule = [];
		console.log(typeof schedule, schedule);
	}
	console.log(typeof schedule, schedule);
}
catch (error) {
	console.error(`Failed to read schedule file: ${error}`);
}

// Load schedule from file
function loadSchedule() {
	try {
		const data = fs.readFileSync(scheduleFile, 'utf-8');
		const loadedSchedule = JSON.parse(data);
		if (Array.isArray(loadedSchedule)) {
			schedule = loadedSchedule;
		}
	}
	catch (error) {
		console.error(`Failed to read schedule file: ${error}`);
	}
}
function deletePastEvents() {
	// Load the schedule from the file
	loadSchedule();

	// Get the current time
	const now = new Date();

	// Filter out any events whose eventTime is in the past
	const deletedEvents = [];
	schedule = schedule.filter((event) => {
		const eventTime = new Date(event.eventTime);
		if (eventTime <= now) {
			deletedEvents.push(event.eventName);
			return false;
		}
		return true;
	});

	// Save the updated schedule to the file
	saveSchedule();

	// Log the deleted event names
	if (deletedEvents.length > 0) {
		console.log(`Deleted events: ${deletedEvents.join(', ')}`);
	}
}


// Save schedule to file
function saveSchedule() {
	fs.writeFileSync(scheduleFile, JSON.stringify(schedule, null, 2));
}

// Load schedule on startup
loadSchedule();
deletePastEvents();
saveSchedule();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Schedule a future event')
		.addStringOption(option =>
			option.setName('title')
				.setDescription('The title of the event')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('time')
				.setDescription('The time of the event')
				.setRequired(true)),

	async execute(interaction) {

		// Get options from user input
		const title = interaction.options.getString('title');
		const time = interaction.options.getString('time');
		const eventTime = chrono.parseDate(time);

		// Create message embed with event details
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(title)
			.setDescription(`${title} has been added to the calendar!`)
			.addFields(
				{ name: 'Time', value: `${eventTime}` },
				{ name: 'Reminder?', value: 'React with a 👍 below if you want to be sent a reminder in DM 1 hour before the event.' },
			)
			.setTimestamp();
		// Reply to user with embedded message
		const message = await interaction.reply({ embeds: [embed], fetchReply: true });
		message.react('👍');

		const filter = (reaction, user) => {
			return reaction.emoji.name == '👍' && user.id != message.author.id;
		};

		const collector = message.createReactionCollector({ filter, dispose: true });

		const users = new Set();

		collector.on('collect', async (reaction, user) => {
			if (reaction.emoji.name === '👍') {
				console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
				try {
					const dmChannel = await user.createDM();

					const checkEventTime = async () => {
						const now = new Date();
						if (eventTime <= now) {
							await reaction.users.remove(user);
							clearInterval(intervalId);
							collector.stop(user.id);
							return;
						}
					};

					const intervalId = setInterval(checkEventTime, 60000);

					const dmEmbed = new EmbedBuilder()
						.setColor('#0099ff')
						.setTitle(title)
						.setDescription(`You have requested a reminder for the event: **${title}**`)
						.addFields(
							{ name: 'Time', value: `${eventTime}` },
							{ name: 'Reminder Set By', value: `${user}` },
						)
						.setTimestamp();

					await dmChannel.send({ embeds: [dmEmbed] });

					// Add the user to the set of users who reacted with a 👍
					users.add(user);
					const userIds = Array.from(users, (user) => user.id);

					// Store the event name, time, and the users who reacted in schedule.json

					// Check if the event already exists in schedule.json
					const existingScheduleItem = schedule.find((item) => item.eventName === title && item.eventTime === eventTime.toISOString());
					if (existingScheduleItem) {
						existingScheduleItem.users.push(user.id);
					}
					else {

						// Create a new schedule item if the event doesn't exist already
						const newScheduleItem = {
							id: uuidv4(),
							eventName: title,
							eventTime: eventTime.toISOString(),
							users: userIds,
						};
						schedule.push(newScheduleItem);
					}

					// Write the updated schedule to schedule.json
					fs.writeFileSync(scheduleFile, JSON.stringify(schedule, null, 2));

					// Save schedule.json after writing
					saveSchedule();
				}
				catch (error) {
					console.error(`Could not send DM to user ${user.tag}.`, error);
				}
			}
		});

		// Define handler for removing a reaction
		collector.on('remove', async (reaction, user) => {
			if (reaction.emoji.name === '👍') {
				console.log(`Removed ${reaction.emoji.name} from ${user.tag}.`);

				// Find the schedule item for the removed reaction
				const scheduleItem = schedule.find((item) => item.eventName === title && item.eventTime === eventTime.toISOString());
				scheduleItem.users = scheduleItem.users.filter((id) => id !== user.id);

				// Save schedule.json after updating
				saveSchedule();
			}
		});

		const reminderTime = new Date(eventTime.getTime() - 60 * 60 * 1000);
		const now = new Date();
		const delay = reminderTime.getTime() - now.getTime();

		setTimeout(() => {
			collector.stop();
		}, delay);

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} items`);

			// Send a direct message to each user in the set one hour before the event
			const dmEmbed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle(title)
				.setDescription(`Reminder! **${title}** is starting in 1 hour.`)
				.addFields(
					{ name: 'Time', value: `${eventTime}` },
				)
				.setTimestamp();

			users.forEach(async (user) => {
				try {
					const dmChannel = await user.createDM();
					await dmChannel.send(dmEmbed);
				}
				catch (error) {
					console.error(`Failed to send direct message to ${user.tag}: ${error}`);
				}
			});
		});

	},
};
setInterval(deletePastEvents, 86400000);