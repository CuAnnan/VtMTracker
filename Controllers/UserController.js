const   Controller = require('./Controller'),
        DiscordIdentityController = require('./DiscordIdentityController'),
        DiscordIdentityRequest = require('../schemas/DiscordIdentityRequest'),
        {UserSchema, DiscordIdentityRequestSchema, DiscordUserSchema} = require('../schemas/AllSchemas'),
        bcrypt = require('bcryptjs'),
        botFactory = require('../DiscordBot/ServerBot'),
        validators = require('../validators');


class UserController extends Controller
{
    async requestFollowUpAction(req, res)
    {
        let loggedInUser = await this.getLoggedInUser(req),
            reference = req.body.requestReference,
            discordUser = await DiscordUserSchema.findOne({discordUserId:reference}),
            requestSet = await DiscordIdentityRequestSchema.findOne({requests:discordUser}),
            bot = botFactory.getStaticInstance(),
            approve = req.body.approve;
        requestSet.requests.pull(discordUser);
        requestSet.save();
        if(approve === 'true')
        {
            loggedInUser.discordUserReferences.addToSet(discordUser);
            loggedInUser.save();
            bot.messageUser(discordUser, 'You have been authenticated on this account');
        }
        else
        {
            bot.messageUser(discordUser, 'You have been denied access to that account');
        }
        await res.json({success:true});
        return null;
    }

    async indexAction(req, res)
    {
        let user = await this.getLoggedInUser(req);
        if(user)
        {
            await this.accountAction(req, res);
        }
        else
        {
            await this.registrationFormAction(req, res);
        }
        return null;
    }

    async accountAction(req, res)
    {
        let user = await this.getLoggedInUser(req),
            identityRequestsForUser = await DiscordIdentityRequest
                .findOne({user:user})
                .populate('requests'),
            requests = identityRequestsForUser?identityRequestsForUser.requests:[];

        res.render('users/accountsPage', {user:user, identityRequests:requests});
        return null;
    }

    async registrationFormAction(req, res, errors)
    {
        errors = errors?errors:{};
        res.render('users/registrationForm', {form:req.body, errors:errors});
        return null;
    }

    async hashPassword(password)
    {
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);
        return {salt:salt, hash:hash};
    }

    async logoutAction(req, res)
    {
        req.session.user = {id:null};
        res.json({result:true});
    }

    async loginAction(req, res)
    {
        let user = await UserSchema.findOne({email:req.body.email}),
            errorMessage = {error: 'Could not find a user with matching email and password', success: false};
        if(!user)
        {
            res.json(errorMessage);
            return null;
        }

        let passwordMatch = await bcrypt.compare(req.body.password, user.passwordHash);
        if(!passwordMatch)
        {
            res.json(errorMessage);
            return null;
        }

        let sessionUserObject = {
            id: user.reference,
            reference: user.reference,
            displayName: user.displayName,
            email:user.email
        };

        req.session.user = sessionUserObject;
        sessionUserObject.success = true;
        res.json(sessionUserObject);
        return null;
    }


    async registrationAction(req, res) {
        let form = req.body,
            errorsFound = false,
            errors = {},
            passwordError = validators.password(form.password, form['password-confirm']);
        let userCheck = await this.getUserByEmail(form.email);

        if(userCheck)
        {
            errors.email = 'Email address already in use';
            errorsFound = true;
        }

        if (passwordError)
        {
            errors.password = passwordError;
            errorsFound = true;
        }

        if(errorsFound)
        {
            this.registrationFormAction(req, res, errors);
        }
        else
        {
            let hash = await this.hashPassword(form.password);
            let user = {
                email:form.email,
                displayName:form.displayName,
                passwordHash:hash.hash,
                passwordSalt:hash.salt
            };
            await UserSchema.create(user);
            res.render('users/accountCreated', {user:user});
        }
        return null;
    }
}

module.exports = new UserController();