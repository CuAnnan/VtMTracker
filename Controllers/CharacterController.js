const   Character = require('../Model/Character'),
        Controller = require('./Controller'),
        CharacterSchema = require('../schemas/Character'),
        CharacterPermissions = require('../schemas/CharacterPermissions');

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
            CharacterPermissions.create({
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
            permissionCheck = await CharacterPermissions.findOne({user:user, character:characterEntity});
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
}

module.exports = new CharacterController();