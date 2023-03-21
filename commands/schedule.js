const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('event')
		.setDescription('Schedule a future event')
		.addStringOption(option =>
			option.setName('title')
				.setDescription('The title of the event')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('date')
				.setDescription('The date of the event (in YYYY-MM-DD format)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('time')
				.setDescription('The time of the event (in HH:MM format)')
				.setRequired(true)),

	async execute(interaction) {

		// Get options from user input
		const title = interaction.options.getString('title');
		const date = interaction.options.getString('date');
		const time = interaction.options.getString('time');

		// Create date object for event
		const eventDate = new Date(`${date}T${time}:00`);

		// Create message embed with event details
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(title)
			.setDescription(`Scheduled for ${eventDate.toLocaleString()}`)
			.addFields(
				{ name: 'Date', value: date },
				{ name: 'Time', value: time },
			);
		// Reply to user with embedded message
		await interaction.reply({ embeds: [embed] });
	},
};