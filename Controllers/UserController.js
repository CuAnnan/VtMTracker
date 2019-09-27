const   Controller = require('./Controller'),
        User = require('../schemas/User'),
        bcrypt = require('bcryptjs'),
        validators = require('../validators');

class UserController extends Controller
{
    async indexAction(req, res)
    {
        if(req.session.user)
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
        let user = this.getLoggedInUser(req);
        res.render('users/accountsPage', {user:user});
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
        let user = await User.findOne({email:req.body.email}),
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
            await User.create(user);
            res.render('users/accountCreated', {user:user});
        }
        return null;
    }
}

module.exports = new UserController();