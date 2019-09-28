const   Controller = require('./Controller'),
        {UserSchema, DiscordIdentityRequestSchema, DiscordUserSchema} = require('../schemas/AllSchemas');

class DiscordIdentityController extends Controller
{
    async getLocalDiscordUserByReference(discordUser)
    {
        let data = {discordUserId:discordUser.id, discordUserTag:discordUser.tag};
        let user = await DiscordUserSchema.findOne({discordUserId:data.discordUserId});
        if(!user)
        {
            user = await DiscordUserSchema.create(data);
        }
        return user;
    }

    async getLocalDiscordUserById(discordUserId)
    {
        let user = await DiscordUserSchema.findOne({discordUserId:discordUserId});
        return user;
    }

    async addDiscordUserIdentificationRequest(discordUser, userReference)
    {
        let localDiscordUser = await this.getLocalDiscordUserByReference(discordUser),
            user = await UserSchema.findOne({reference:userReference}),
            idRequest = await DiscordIdentityRequestSchema.findOne({user:user});
        if(!idRequest)
        {
            idRequest = await DiscordIdentityRequestSchema.create({
                user:user,
                requests:[]
            });
        }
        idRequest.requests.addToSet(localDiscordUser);
        idRequest.save();
        return idRequest;
    }
}

module.exports = new DiscordIdentityController();