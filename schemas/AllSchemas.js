let package = {
    CharacterSchema : require('./Character'),
    CharacterPermissionsSchema : require('./CharacterPermissions'),
    DiscordIdentityRequestSchema : require('./DiscordIdentityRequest'),
    DiscordUserSchema : require('./DiscordUser'),
    GameSchema : require('./Game'),
    UserSchema : require('./User'),
    CharacterUpdateSchema: require('./CharacterUpdate')
};

module.exports = package;
