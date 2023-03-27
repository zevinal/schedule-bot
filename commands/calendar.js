const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const chrono = require('chrono-node');
const buttonCounts = {};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('availability')
		.setDescription('Displays the following week\'s dates as buttons.'),
	async execute(interaction) {
		console.log('Executing weekdates command...');
		console.log('Interaction received:', interaction);

		// NOTE: THIS COMMAND WAS BUILT WITH ONLY FIVE PEOPLE IN MIND. IT CAN ONLY REGISTER UP TO TEN VOTES PER DATE LISTED
		// Getting next week's days and dates
		const now = new Date();
		const today = now.getDay();
		const daysUntilNextWeek = 7 - today;
		const nextWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextWeek);
		const nextWeekDates = [];
		for (let i = 0; i < 7; i++) {
			const nextDay = new Date(nextWeekStart.getFullYear(), nextWeekStart.getMonth(), nextWeekStart.getDate() + i);
			nextWeekDates.push(nextDay.toDateString());
		}

		// Creating the rows of buttons
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
		// Two rows are needed as only 5 buttons fit on each
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


		// Set up initial graph
		let graph = '';
		const blackBlock = '　';
		const whiteBlock = '▇';
		for (const date of nextWeekDates) {
			const count = 0;
			const blocks = blackBlock.repeat(10 - count) + whiteBlock.repeat(count);
			graph += `${date}: ${blocks} ${count}\n`;
		}

		// Create message embed with the following week's dates and a bar graph
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle('Next Session')
			.setDescription('Here are the dates for next week, select your most preferred day(s):')
			.addFields({ name: 'Availability', value: '```' + graph + '```' });

		// Reply to user with embedded message
		await interaction.reply({ embeds: [embed], components: [row1, row2] });
		console.log('Reply sent.');


		const filter = (reaction) => {
			return nextWeekDates.includes(reaction.customId);
		};

		const collector = interaction.channel.createMessageComponentCollector({ filter });
		collector.on('collect', async (available) => {
			console.log('Button clicked:', available.customId);

			// Getting the click count on each of the buttons
			const buttonId = available.customId;
			if (!buttonCounts[buttonId]) {
				buttonCounts[buttonId] = 1;
			}
			else {
				buttonCounts[buttonId]++;
			}

			// Update graph with the new click count
			const date = new Date(buttonId).toDateString();
			const lineIndex = nextWeekDates.findIndex(d => d === date);
			const line = graph.split('\n')[lineIndex];
			const countIndex = line.indexOf(blackBlock);
			const oldCount = parseInt(line.slice(countIndex + 1));
			const newCount = oldCount + 1;
			const newLine = line.slice(0, countIndex) + whiteBlock + blackBlock.repeat(10 - newCount) + ` ${newCount}`;
			const updatedLines = graph.split('\n').map((l, i) => i === lineIndex ? newLine : l);
			graph = updatedLines.join('\n');


			// Update the embedded message
			const updatedEmbed = new EmbedBuilder(embed)
				.spliceFields(0, 1)
				.addFields({ name: 'Availability', value: '```' + graph + '```' });

			await available.update({ embeds: [updatedEmbed] });
			console.log(`${buttonId} button has been clicked ${buttonCounts[buttonId]} times.`);
		});


		collector.on('end', () => {
			console.log('Button click collection ended.');
		});
	},
};
