const XPPurchasable = require('./XPPurchasable');

class Virtue extends XPPurchasable
{
    constructor(name)
    {
        super(name, 0, 5);
    }


}

module.exports = Virtue;