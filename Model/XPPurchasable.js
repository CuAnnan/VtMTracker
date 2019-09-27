class XPPurchasable
{
    constructor(name, min)
    {
        this.name = name;
        this.min = min;
        this.bought = 0;
    }

    set level(level)
    {
        this.bought = level - this.min;
    }

    get level()
    {
        return this.min + this.bought;
    }

    toJSON()
    {
        return {name:this.name, min:this.min, bought:this.bought};
    }

    loadJSON(json)
    {
        this.name = json.name;
        this.min = json.min;
        this.bought = json.bought;
    }

    static fromJSON(json)
    {
        let obj =  new this(json.name, json.min);
        obj.bought = json.bought;
    }
}

module.exports = XPPurchasable;