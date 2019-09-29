let mongoose = require('mongoose'),
    shortid = require('shortid'),
    Game = new mongoose.Schema({
        reference:{type:String, default:shortid.generate},
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name:{type:String},
        discordGuildId:{type:String},
        discordGuildName:{type:String},
        discordGuildLinks:[{type:String}],
        characters: [{type: mongoose.Schema.Types.ObjectId, ref:'Character'}],
        players:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}]
    });

module.exports = mongoose.model('Game', Game);