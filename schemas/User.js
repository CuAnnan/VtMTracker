let mongoose = require('mongoose'),
    shortid = require('shortid'),
    User = new mongoose.Schema({
        reference:{type:String, default:shortid.generate},
        email:{type:String,unique:true,required:true,trim:true},
        displayName:{type:String,unique:true,required:true,trim:true},
        passwordHash:{type:String, required:true, trim:true},
        passwordSalt:{type:String, required:true, trim:true},
        created:{type:String, default:Date.now},
        discordUserReferences:[{type:mongoose.Schema.Types.ObjectId, ref:'DiscordUser'}]
    });

module.exports = mongoose.model('User', User);