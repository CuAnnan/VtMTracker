let mongoose = require('mongoose'),
    shortid = require('shortid'),
    CharacterUpdate = new mongoose.Schema({
        reference:{type:String, default:shortid.generate},
        character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
        update:{type:Object},
        timestamp:{type:Date, default:Date.now}
    });

module.exports = mongoose.model('CharacterUpdate', CharacterUpdate);