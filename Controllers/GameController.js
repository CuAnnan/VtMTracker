const   Controller = require('./Controller'),
        CharacterSchema = require('../schemas/Character'),
        CharacterPermissionSchema = require('../schemas/CharacterPermissions'),
        UserSchema = require('../schemas/User'),
        GameSchema = require('../schemas/Game');

class GameController extends Controller
{
    async indexAction(req, res)
    {
        let loggedInUser = await this.getLoggedInUser(req),
            gamesRun = await GameSchema.find({owner:loggedInUser}),
            gamesPlayed = await GameSchema.find({player:loggedInUser});
        res.render('games/index', {gamesRun:gamesRun, gamesPlayed:gamesPlayed});
        return null;
    }

    async newAction(req, res)
    {
        let loggedInUser = await this.getLoggedInUser(req),
            game = await GameSchema.create({
                name:req.body.name,
                owner:loggedInUser,
                players:[loggedInUser]
            });
        await res.json({
            reference:game.reference
        });
        return null;
    }

    async showAction(req, res)
    {
        let loggedInUser = await this.getLoggedInUser(req),
            game = await GameSchema
                .findOne({reference:req.params.reference})
                .populate({
                    path:'characters',
                    populate: {path: 'owner'}
                })
                .populate('owner')
                .populate('players');

        res.render('games/show', {game:game});
        return null;
    }

    async inviteAction(req, res)
    {
        let loggedInUser = await this.getLoggedInUser(req),
            reference = req.params.reference;
        if(!loggedInUser.reference)
        {
            res.render('login', {redirect:`/games/invite/${reference}`});
            return null;
        }
        let game = await GameSchema.findOne({reference:reference});
        let characters = await CharacterSchema.find({owner:loggedInUser});
        res.render('games/join', {characters:characters, game:game});
        return null;
    }

    async joinAction(req, res)
    {
        let loggedInUser = await this.getLoggedInUser(req),
            character = await CharacterSchema.findOne({reference:req.body.characterReference}),
            game = await GameSchema.findOne({reference:req.params.reference});
        game.players.addToSet(loggedInUser);
        game.characters.addToSet(character);
        game.save();
        CharacterPermissionSchema.create({
            user:game.owner,
            character:character
        });
        res.redirect(`/games/show/${game.reference}`);
        return null;
    }

    async removeCharacterAction(req, res)
    {
        let loggedInUser = await this.getLoggedInUser(req),
            character = await CharacterSchema.findOne({reference:req.body.characterReference}),
            game = await GameSchema.findOne({reference:req.body.gameReference});
        try {
            game.characters.pull(character);
            game.save();
            await res.json({success:true});
        }
        catch(e)
        {
            await res.json({success:false, error:e});
        }
        return null;
    }

    async removePlayerAction(req, res)
    {
        let loggedInUser = await this.getLoggedInUser(req),
            game = await GameSchema.findOne({reference:req.body.gameReference}).populate('owner');
        if(req.body.playerReference === game.owner.reference)
        {
            await res.json({success:false, message:'You cannot remove yourself from a game you run'});
        }
        else
        {
            let user = await UserSchema.findOne({reference: req.body.playerReference}),
                characters = await CharacterSchema.find({owner:user});
            game.players.pull(user);
            game.characters.pull(characters);
            game.save();
            await res.json({success: true});
        }
        return null;
    }

    async linkServer(gameReference, discordServer)
    {
        let game = await GameSchema.findOne({reference:gameReference});
        game.discordGuildId = discordServer.id;
        game.discordGuildName = discordServer.name;
        let invites = Array.from(await discordServer.fetchInvites());
        for(let invite of invites)
        {
            if(!invite.temporary)
            {
                game.discordGuildLinks.addToSet(invite[0]);
            }
        }
        game.save();

    }
}

module.exports = new GameController();