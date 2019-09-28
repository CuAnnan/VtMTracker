const   WoDDiceBot = require('./WoDDiceBot'),
        DiscordIdentityController = require('../Controllers/DiscordIdentityController');
let instancedBot = null;
class ServerBot extends WoDDiceBot
{
    static instantiateStaticBot(conf)
    {
        if(!instancedBot)
        {
            instancedBot = new ServerBot(conf);
        }
        return instancedBot;
    }

    static getStaticInstance()
    {
        if(!instancedBot)
        {
            throw new Error('Bot has not been instanced');
        }
        return instancedBot;
    }

    messageUser(localDiscordUser, message)
    {
        let user = this.client.users.get(localDiscordUser.discordUserId);
        this.sendDM(user, message);
    }

    attachCommands()
    {
        super.attachCommands();
        this.attachCommand('identify', this.identifyUser);
        this.attachCommand('checkout', this.checkCharacterOut);
        this.attachCommand('stow', this.stowCharacter);
    }

    /**
     * This method is used to connect a user on discord with a user in the UserSchema
     */
    async identifyUser(commandParts, message)
    {
        let localUserReference = commandParts[0];
        if(!localUserReference)
        {
            await message.reply('You need to provide the user reference');
            return null;
        }

        await DiscordIdentityController.addDiscordUserIdentificationRequest(message.author, localUserReference);

        await message.reply('A request has been sent to the webserver to connect your account here with your account there. You will have to confirm it there, for security purposes.');
        return null;
    }

    async checkCharacterOut(commandParts, message)
    {

    }

    async stowCharacter(commandParts, message)
    {

    }
}

module.exports = ServerBot;