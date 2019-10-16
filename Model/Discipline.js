const XPPurchasable = require('./XPPurchasable');

class DisciplinePower
{
    constructor(name, poolFactors, level, cost, learned)
    {
        this.name = name;
        this.poolFactors = poolFactors;
        this.level = level;
        this.cost = cost?cost:null;
    }

    toJSON()
    {
        return {
            name:this.name,
            poolFactors:this.poolFactors,
            level:this.level,
            cost:this.cost
        };
    }

    static fromJSON(json)
    {
        return new DisciplinePower(json.name, json.poolFactors, json.level, json.cost);
    }
}

class Discipline extends XPPurchasable
{
    constructor(name)
    {
        super(name, 0);
        this.powers = {};
    }

    toJSON()
    {
        let json = super.toJSON();
        json.powers = [];
        for(let powerList of Object.values(this.powers))
        {
            for(let power of powerList)
            {
                json.powers.push(power.toJSON());
            }
        }
        return json;
    }

    addPower(power)
    {
        if(!this.powers[power.level])
        {
            this.powers[power.level] = [];
            if(power.bought && power.level > this.bought)
            {
                this.bought = power.level;
            }
        }
        this.powers[power.level].push(power);
    }

    static fromJSON(json)
    {
        let discipline = new Discipline(json.name);
        for(let power of json.powers)
        {
            discipline.addPower(DisciplinePower.fromJSON(power));
        }
        return discipline;
    }

}

module.exports = Discipline;