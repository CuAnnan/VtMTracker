const XPPurchasableWithSpecialty = require('./XPPurchasableWithSpeciality');

class Attribute extends XPPurchasableWithSpecialty
{
    constructor(name)
    {
        super(name, 1);
    }

}

module.exports = Attribute;