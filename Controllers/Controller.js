const   User = require('../schemas/User');

class Controller
{
    async getUserByEmail(email)
    {
        return User.findOne({email:email});
    }

    async getSessionUser(sessionUser, returnProperties, populate = {})
    {
        let user, userSearch= {email:sessionUser.email};

        if(returnProperties)
        {
            user = await User.findOne(userSearch, returnProperties);
        }
        else
        {
            user = await User.findOne(userSearch);
        }

        if(populate)
        {
            for(let i in populate)
            {
                user.populate(i, populate[i]);
            }
        }

        return user;
    }

    async getLoggedInUser(req, returnProperties, populate)
    {
        if (!req.session.user)
        {
            return {_id:null};
        }

        return this.getSessionUser(req.session.user, returnProperties, populate);
    }

    getHost(req)
    {
        return `${req.protocol}://${req.get('Host')}`;
    }
}

module.exports = Controller;