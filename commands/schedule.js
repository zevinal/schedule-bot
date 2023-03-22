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
			return reaction.emoji.name == '👍' && user.id == interaction.user.id;
		};

		const collector = message.createReactionCollector({ filter, time: 60000 });

		collector.on('collect', (reaction, user) => {
			console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
		});

		collector.on('end', collected => {
			console.log(`Collected ${collected.size} items`);
		});

	},
};