const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const chrono = require('chrono-node');

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

		const collector = message.createReactionCollector({ filter });

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
				}
				catch (error) {
					console.error(`Could not send DM to user ${user.tag}.`, error);
				}
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
			const reminderMessage = `Reminder: ${title} is starting in 1 hour!`;

			users.forEach(async (user) => {
				try {
					const dmChannel = await user.createDM();
					await dmChannel.send(reminderMessage);
				}
				catch (error) {
					console.error(`Failed to send direct message to ${user.tag}: ${error}`);
				}
			});
		});

	},
};