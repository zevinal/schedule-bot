const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get the avatar URL of the selected user.')
		.addUserOption(option => option.setName('user').setDescription('The user\'s avatar you want to view.')),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		if (user) return interaction.reply(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`);
		return interaction.reply(`Your avatar: ${interaction.user.displayAvatarURL()}`);
	},
};