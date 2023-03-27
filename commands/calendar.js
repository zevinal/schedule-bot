const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const chrono = require('chrono-node');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('availability')
		.setDescription('Displays the following week\'s dates as buttons.'),
	async execute(interaction) {
		console.log('Executing weekdates command...');
		console.log('Interaction received:', interaction);
		const now = new Date();
		const today = now.getDay();
		const daysUntilNextWeek = 7 - today;
		const nextWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextWeek);
		const nextWeekDates = [];
		for (let i = 0; i < 7; i++) {
			const nextDay = new Date(nextWeekStart.getFullYear(), nextWeekStart.getMonth(), nextWeekStart.getDate() + i);
			nextWeekDates.push(nextDay.toDateString());
		}

		const row1 = new ActionRowBuilder()
			.addComponents(
				nextWeekDates.slice(0, 5).map(date => {
					const chronoDate = chrono.parseDate(date);
					const buttonDate = chronoDate ? chronoDate.toDateString() : date;
					return new ButtonBuilder()
						.setCustomId(buttonDate)
						.setLabel(buttonDate)
						.setStyle(ButtonStyle.Primary);
				}),
			);
		const row2 = new ActionRowBuilder()
			.addComponents(
				nextWeekDates.slice(5, 7).map(date => {
					const chronoDate = chrono.parseDate(date);
					const buttonDate = chronoDate ? chronoDate.toDateString() : date;
					return new ButtonBuilder()
						.setCustomId(buttonDate)
						.setLabel(buttonDate)
						.setStyle(ButtonStyle.Primary);
				}),
			);
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('Next Session')
			.setDescription('Here are the dates for next week, select your most preferred day:');

		await interaction.reply ({ embeds: [embed], components: [row1, row2] });
		console.log('Reply sent.');

		const filter = (reaction) => {
			return nextWeekDates.includes(reaction.customId);
		};

		const collector = interaction.channel.createMessageComponentCollector({ filter });

		const buttonCounts = {};
		collector.on('collect', (available) => {
			console.log('Button clicked:', available.customId);
			const buttonId = available.customId;
			if (!buttonCounts[buttonId]) {
				buttonCounts[buttonId] = 1;
			}
			else {
				buttonCounts[buttonId]++;
			}
			console.log(`${buttonId} button has been clicked ${buttonCounts[buttonId]} times.`);
		});

		collector.on('end', () => {
			console.log('Button click collection ended.');
		});
	},
};
