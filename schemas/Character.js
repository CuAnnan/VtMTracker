let mongoose = require('mongoose'),
    shortid = require('shortid'),
    Character = new mongoose.Schema({
        reference:{type:String, default:shortid.generate},
        json:Object,
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: {type: String},
        clan: {type: String}
    });

module.exports = mongoose.model('Character', Character);