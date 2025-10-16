// index.js
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PREFIX = '!';
const ALLOWED_ROLE_NAMES = ['Owner', 'Admin', 'Server Manager'];
const CHANNEL_ID = process.env.CHANNEL_ID;

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(PREFIX + 'announce')) return;

    const member = message.member;
    const isOwner = message.guild.ownerId === member.id;
    const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
    const isManager = member.permissions.has(PermissionsBitField.Flags.ManageGuild);
    const hasAllowedRole = member.roles.cache.some(r => ALLOWED_ROLE_NAMES.includes(r.name));

    if (!(isOwner || isAdmin || isManager || hasAllowedRole)) {
      return message.reply('❌ You do not have permission to use this command.');
    }

    const announcement = message.content.slice((PREFIX + 'announce').length).trim();
    if (!announcement) {
      return message.reply('❌ Please provide a message. Example:\n`!announce Event starts soon!`');
    }

    const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
    if (!channel) return message.reply('❌ Announcement channel not found. Check CHANNEL_ID.');

    const embed = new EmbedBuilder()
      .setTitle('📢 Emley Heights Announcement')
      .setDescription(announcement)
      .setColor(0x00FFFF)
      .setTimestamp()
      .setFooter({ text: `Posted by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    await channel.send({ embeds: [embed] });
    await message.reply('✅ Announcement posted!');
  } catch (err) {
    console.error('Error handling announce:', err);
    message.reply('⚠️ Error occurred.');
  }
});

client.login(process.env.TOKEN);
