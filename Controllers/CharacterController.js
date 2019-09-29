const   Character = require('../Model/Character'),
        Controller = require('./Controller'),
        {GameSchema, DiscordUserSchema, UserSchema, CharacterSchema, CharacterPermissionsSchema} = require('../schemas/AllSchemas');

class CharacterController extends Controller
{
    async indexAction(req, res)
    {
        let user = await this.getLoggedInUser(req),
            characters = await CharacterSchema.find({owner:user});
        res.render('characters/index', {characters:characters});
        return null;
    }

    async newCharacterAction(req, res)
    {
        try {
            let user = await this.getLoggedInUser(req);
            let character = new Character(req.body.name, req.body.clan);
            let characterEntity = await CharacterSchema.create({
                clan: req.body.clan,
                json: character.toJSON(),
                owner: user,
                name: req.body.name
            });
            CharacterPermissionsSchema.create({
                user:user,
                character:characterEntity
            });

            await res.json({
                success:true,
                reference:characterEntity.reference
            });
        }
        catch(e)
        {
            console.log(e);
            throw(e);
        }
    }

    async loadAction(req, res)
    {
        let character = await this.fetchCharacterEntity(req, req.params.reference);
        res.render('characters/character-build', {character:character});
    }

    async saveAction(req, res)
    {
        try
        {
            let character = await this.fetchCharacterEntity(req, req.body.reference, true);
            character.json = JSON.parse(req.body.json);
            await character.save();
            await res.json({
                success:true
            });
        }
        catch(e)
        {
            console.log(e);
            await res.json({success:false});
        }

        return null;
    }

    async fetchCharacterEntity(req, characterReference, returnRaw)
    {
        let user = await this.getLoggedInUser(req),
            characterEntity = await CharacterSchema.findOne({reference: characterReference}),
            permissionCheck = await CharacterPermissionsSchema.findOne({user:user, character:characterEntity});
        characterEntity.json.reference = characterEntity.reference;
        if(permissionCheck)
        {
            if(returnRaw)
            {
                return characterEntity;
            }
            return Character.fromJSON(characterEntity.json);
        }
        throw new Error('No matching character was found');
    }

    async verifyDiscordPermissionsAndReturnCharacter(characterReference, discordUser)
    {
        let localDiscordUser = await DiscordUserSchema.findOne({discordUserId:discordUser.id}),
            user = await UserSchema.findOne({discordUserReferences:localDiscordUser}),
            characterEntity = await CharacterSchema.findOne({reference:characterReference}),
            permissionCheck = await CharacterPermissionsSchema.findOne({user:user, character:characterEntity});
        return {
            hasPermission:permissionCheck?true:false,
            characterEntity:permissionCheck?characterEntity:null,
            localDiscordUser:localDiscordUser
        }
    }

    async getMostRecentCharacterForGuild(discordMessage)
    {
        let localDiscordUser = await DiscordUserSchema.findOne({discordUserId:discordMessage.author.id}),
            user = await UserSchema.findOne({discordUserReferences:localDiscordUser}),
            game = await GameSchema.findOne({discordGuildId:discordMessage.guild.id}).populate('characters'),
            character = game.characters.find(character=> character.owner._id.equals(user._id));

        if(character)
        {
            return Character.fromJSON(character.json);
        }
        return null;
    }
}

module.exports = new CharacterController();