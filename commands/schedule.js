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
			)
			.setTimestamp();
		// Reply to user with embedded message
		await interaction.reply({ embeds: [embed] });
	},
};