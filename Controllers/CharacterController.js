const   Character = require('../Model/Character'),
        Road = require('../Model/Road'),
        DisciplineData = require('../Model/DisciplineData/DisciplineData'),
        Controller = require('./Controller'),
        moment = require('moment'),
        {GameSchema, DiscordUserSchema, UserSchema, CharacterSchema, CharacterPermissionsSchema, CharacterUpdateSchema} = require('../schemas/AllSchemas');

class CharacterController extends Controller
{
    async indexAction(req, res)
    {
        let user = await this.getLoggedInUser(req);
        if(user._id)
        {
            let characters = await CharacterSchema.find({owner:user});
            res.render('characters/index', {characters:characters});
        }
        else
        {
            res.render('login');
        }
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
            await CharacterPermissionsSchema.create({
                user:user,
                character:characterEntity
            });

            await res.json({
                success:true,
                reference:characterEntity.reference
            });
            return null;
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
        res.render('characters/character-build', {character:character, roads:Road.roadsData, disciplines:DisciplineData});
        return null;
    }

    async buildHistoryAction(req, res)
    {
        let character = await this.fetchCharacterEntity(req, req.params.reference, true),
            history = await CharacterUpdateSchema.find({character:character}).sort({'timestamp':'desc'});
        res.render('characters/buildHistory', {character:character, history:history, moment:moment});
        return null;
    }

    async saveAction(req, res)
    {
        try
        {
            let character = await this.fetchCharacterEntity(req, req.body.reference, true);
            character.json = JSON.parse(req.body.json);

            await character.save();
            await CharacterUpdateSchema.create({
                character:character,
                update:JSON.parse(req.body.changeData)
            });
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

    /**
     * This method performs the permission check to see that a logged in user has the permissions to view a character
     * @param req
     * @param characterReference
     * @param returnRaw
     * @returns {Promise<Character>}
     */
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
            game = await GameSchema.findOne({discordGuildId:discordMessage.guild.id}).populate('characters');
        if(!game)
        {
            return null;
        }
        let character = game.characters.find(character=> character.owner._id.equals(user._id));

        if(character)
        {
            return Character.fromJSON(character.json);
        }
        return null;
    }

    async aboutAction(req, res)
    {
        res.render('characters/about');
    }
}

module.exports = new CharacterController();