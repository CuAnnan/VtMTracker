let mongoose = require('mongoose'),
    DiscordUser = new mongoose.Schema({
        discordUserId:{type:String, required:true},
        discordUserTag:{type:String, required:true}
    });

module.exports = mongoose.model('DiscordUser', DiscordUser);