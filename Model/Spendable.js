const   XPPurchasable = require('./XPPurchasable');

class Spendable extends XPPurchasable {
    constructor(name, min)
    {
        super(name, 0);
        this.spent = 0;
    }

    spend(amount)
    {
        amount = parseInt(amount);
        if(this.spent + amount < this.level)
        {
            this.spent += amount;
            return true;
        }
        return false;
    }

    toJSON()
    {
        let json = super.toJSON();
        json.spent = this.spent;
    }

    static fromJSON(json)
    {
        let obj = new this(json.name, json.min);
        obj.spent = json.spent;
        return obj;
    }
}

module.exportes = Spendable;