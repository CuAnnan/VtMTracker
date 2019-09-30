const   roadsData = require('./roadsData'),
        XPPurchasable = require('./XPPurchasable'),
        Virtue = require('./Virtue');

class Road extends XPPurchasable
{
    constructor(name, aura)
    {
        super(name, 0, 10);
        this.name = name;
        this.virtue1 = null;
        this.virtue2 = null;
        this.aura = aura;
    }

    setVirtue1(virtue)
    {
        this.virtue1 = virtue;
        return this;
    }

    setVirtue2(virtue)
    {
        this.virtue2 = virtue;
        return this;
    }

    toJSON()
    {
        return {
            name:this.name,
            virtue1:this.virtue1,
            virtue2:this.virtue2,
            aura:this.aura,
            bought:this.bought
        }
    }

    static fromJSON(json)
    {
        let road = new Road(json.name, json.aura)
            .setVirtue1(Virtue.fromJSON(json.virtue1))
            .setVirtue2(Virtue.fromJSON(json.virtue2));
        road.bought = json.bought;
        return road;
    }

    static get roadsData()
    {
        return roadsData;
    }

    static fromArray(array)
    {
        return new Road(
                array[0],
                array[3]
            )
            .setVirtue1(new Virtue(array[1]))
            .setVirtue2(new Virtue(array[2]));
    }

    static byName(name)
    {
        let roadData = roadsData.find(val=>val[0]===name);
        let road = Road.fromArray(roadData);
        return road;
    }
}

module.exports = Road;