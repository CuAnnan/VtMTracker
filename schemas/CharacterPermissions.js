let mongoose = require('mongoose'),
    shortid = require('shortid'),
    CharacterPermissions = new mongoose.Schema({
        reference:{type:String, default:shortid.generate},
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        character:{type:mongoose.Schema.Types.ObjectId, ref: 'Character'}
    });

module.exports = mongoose.model('CharacterPermissions', CharacterPermissions);