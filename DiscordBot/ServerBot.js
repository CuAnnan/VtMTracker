const   WoDDiceBot = require('./WoDDiceBot'),
        GameController = require('../Controllers/GameController'),
        CharacterController = require('../Controllers/CharacterController'),
        DiscordIdentityController = require('../Controllers/DiscordIdentityController'),
        {Action} = require('./DiceRoller'),
        Character = require('../Model/Character'),
        ObjectCache = require('objectcache');
let instancedBot = null;
class GuildNotAvailableError extends Error{}
const characterCache = new ObjectCache(3600000);

/**
 * This extension of the bot is for integration with the webserver
 */
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
        this.attachCommand('linkServer', this.linkServer);
        this.attachCommand('wprefresh', this.serverCharacterWillpowerReset);
    }

    async serverCharacterWillpowerReset(commandParts, message, comment)
    {
        let wpAmount = commandParts[0];
        wpAmount = wpAmount ? wpAmount : 1;
        await message.reply(`All characters on this server have had their willpower increased by ${wpAmount}`);
    }

    async getCharacterForCurrentUser(message)
    {
        let character = characterCache.get(message.author.id);
        if(!character)
        {
            character = await CharacterController.getMostRecentCharacterForGuild(message);
            if(character)
            {
                characterCache.put(message.author.id, character);
                this.getServerCache(message);
            }
        }
        return character;
    }

    getServerCache(message)
    {

    }

    async simpleRoll(commandParts, message, comment)
    {
        let character = await this.getCharacterForCurrentUser(message);

        if(character)
        {
            this.rollForCharacter(commandParts, message, comment, character);
        }
        else
        {
            super.simpleRoll(commandParts, message, comment);
        }
        return null;
    }

    async rollForCharacter(commandParts, message, comment, character)
    {
        let factoredPool = 0,
            {difficulty, specialty, willpower} = this.preParseRoll(message.content.toLowerCase()),
            factors = [];
        for(let part of commandParts)
        {
            part = part.toLowerCase();
            if(character.lookups[part])
            {
                let factor = character.lookups[part];
                factoredPool += factor.level;
                difficulty += (factor.level == 0 && factor.unskilledPenalty)?factor.unskilledPenalty:0;
                factors.push(factor.name);
            }
            else
            {
                let partTest = parseInt(part);
                if(!isNaN(partTest))
                {
                    factoredPool += partTest;
                    factors.push(partTest);
                }
            }
        }
        if(difficulty >= 10)
        {
            await message.reply('You are not sufficiently skilled to qualify for this roll');
            return;
        }
        // TODO: Reduce the checked out character's willpower and save it
        let action = new Action(factoredPool, difficulty, specialty, willpower, factors);
        let results = action.getResults();
        this.displayResults(message, results, comment);
    }


    async linkServer(commandParts, message)
    {
        if(message.guild.available)
        {
            let gameReference = commandParts[0];
            await GameController.linkServer(gameReference, message.guild);
            await message.reply('Game server linked to game entity');
        }
        return null;
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
        let {hasPermission, characterEntity, localDiscordUser} = await CharacterController.verifyDiscordPermissionsAndReturnCharacter(commandParts[0], message.author);
        if(hasPermission)
        {
            let toon = Character.fromJSON(characterEntity.json);
            characterCache.put(message.author.id, toon);
            await message.reply(`Character ${toon.name} is checked out for use`);
        }
        else
        {
            await message.reply('You do not have permissions on this character');
        }

    }

    get helpText()
    {
        let helpText = super.helpText;
        helpText.push('Rolling with character skills and attributes (see: http://vtm.so-4pt.net/characters/about/)');
        helpText.push('     `!roll dexterity melee` will roll your flat dexterity plus melee at diff 6');
        helpText.push('     `!roll dexterity melee 5` will roll your dexterity plus melee plus 5');
        return helpText;
    }

    async stowCharacter(commandParts, message)
    {
        characterCache.remove(message.author.id);
        await message.reply('Your character has been stowed');
        return null;
    }
}

module.exports = ServerBot;