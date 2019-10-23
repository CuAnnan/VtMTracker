const XPPurchasableWithSpecialty  = require('./XPPurchasableWithSpeciality');

class Ability extends XPPurchasableWithSpecialty
{
    constructor(name, unskilledPenalty)
    {
        super(name, 0);
        this.unskilledPenalty = unskilledPenalty;
    }

    get penalty()
    {
        if(this.level)
        {
            return 0;
        }
        return this.unskilledPenalty;
    }

}

module.exports = Ability;