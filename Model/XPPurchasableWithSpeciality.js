const XPPurchasable  = require('./XPPurchasable');

class UnavailableSpecialtyError extends Error{}

class XPPurchasableWithSpeciality extends XPPurchasable
{
    constructor(name, min, max)
    {
        super(name, min, max);
        this.specialties = [];
    }

    addSpecialty(specialty)
    {
        if(this.level < 4)
        {
            throw new UnavailableSpecialtyError('Minimum level of 4 not reached');
        }
        if(this.availableSpecialties <= 0)
        {
            throw new UnavailableSpecialtyError(`You can only have one specialty for each level above 4, you already have ${this.specialities.length}`);
        }
        this.specialties.push(specialty);
    }

    removeSpecialty(specialty)
    {
        this.specialties.splice(this.specialties.indexOf(specialty),1);
    }

    get availableSpecialties()
    {
        return 4 - this.specialties.length;
    }

    toJSON()
    {
        let json = super.toJSON();
        json.specialties = this.specialties;
        return json;
    }

    static fromJSON(json)
    {
        let obj = super.fromJSON(json);
        obj.specialties = json.specialties;
        return obj;
    }
}
module.exports = XPPurchasableWithSpeciality;