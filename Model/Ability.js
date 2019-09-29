const XPPurchasableWithSpecialty  = require('./XPPurchasableWithSpeciality');

class Ability extends XPPurchasableWithSpecialty
{
    constructor(name, unskilledPenalty)
    {
        super(name, 0);
        this.unskilledPenalty = unskilledPenalty;
    }

}

module.exports = Ability;