let mongoose = require('mongoose'),
    shortid = require('shortid'),
    DiscordIdentityRequest = new mongoose.Schema({
        reference:{type:String, default:shortid.generate},
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        requests:[{type:mongoose.Schema.Types.ObjectId, ref:'DiscordUser'}]
    });

module.exports = mongoose.model('DiscordIdentityRequest', DiscordIdentityRequest);