class XPPurchasable
{
    constructor(name, min, max)
    {
        this.name = name;
        this.min = min;
        this.max = max;
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
        return {
            name:this.name,
            min:this.min,
            bought:this.bought,
            className:this.constructor.name
        };
    }

    loadJSON(json)
    {
        this.name = json.name;
        this.min = json.min;
        this.max = json.max;
        this.bought = json.bought;
    }

    static fromJSON(json)
    {
        let obj =  new this(json.name, json.min, json.max);
        obj.bought = json.bought;
        return obj;
    }
}

module.exports = XPPurchasable;