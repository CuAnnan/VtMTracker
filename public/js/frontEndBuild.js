(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{"./XPPurchasableWithSpeciality":5}],2:[function(require,module,exports){
const XPPurchasableWithSpecialty = require('./XPPurchasableWithSpeciality');

class Attribute extends XPPurchasableWithSpecialty
{
    constructor(name)
    {
        super(name, 1);
    }

}

module.exports = Attribute;
},{"./XPPurchasableWithSpeciality":5}],3:[function(require,module,exports){
const   Attribute = require('./Attribute'),
        Ability = require('./Ability'),
        attributes = {
            Physical:['Strength', 'Dexterity', 'Stamina'],
            Social:['Charisma', 'Manipulation', 'Appearance'],
            Mental:['Perception', 'Intelligence', 'Wits']
        },
        abilities = {
            Talents:['Alertness', 'Athletics', 'Awareness', 'Brawl', "Empathy", 'Expression', 'Intimidation', 'Leadership', 'Legerdemain', 'Subterfuge'],
            Skills:['Animal Ken', 'Archery', 'Commerce', 'Crafts', 'Etiquette', 'Melee', 'Performance', 'Ride', 'Stealth', 'Survival'],
            Knowledges:['Academics', 'Enigmas', 'Hearth Wisdom', 'Investigation', 'Law', 'Medicine', 'Occult', 'Politics', 'Seneschal', 'Theology']
        },
        abilityPenalties = {
            Talents:0,
            Skills:1,
            Knowledges:10
        };

class Character
{
    constructor(name, clan, reference)
    {
        this.name = name;
        this.clan = clan;
        this.reference = reference;
        this.attributes = {};
        this.lookups = {};
        this.abilities = {};
        for(let useGroup in attributes)
        {
            this.attributes[useGroup] = [];
            for(let attributeName of attributes[useGroup])
            {
                let attribute = new Attribute(attributeName);
                this.attributes[useGroup].push(attribute);
                this.lookups[attributeName.toLowerCase()] = attribute;
            }
        }
        for(let useGroup in abilities)
        {
            this.abilities[useGroup] = [];
            for(let abilityName of abilities[useGroup])
            {
                let ability = new Ability(abilityName,abilityPenalties[useGroup]);
                this.abilities[useGroup].push(ability);
                this.lookups[abilityName.toLowerCase()] = ability;
            }
        }
    }

    toJSON()
    {
        return {
            name:this.name,
            clan:this.clan,
            reference:this.reference,
            lookups:this.lookups
        };
    }

    static fromJSON(json)
    {
        let character = new Character(json.name, json.clan, json.reference);
        for(let lookup of Object.values(json.lookups))
        {
            character.lookups[lookup.name.toLowerCase()].loadJSON(lookup);
        }
        return character;
    }
}

module.exports = Character;
},{"./Ability":1,"./Attribute":2}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
const XPPurchasable  = require('./XPPurchasable');

class UnavailableSpecialtyError extends Error{}

class XPPurchasableWithSpeciality extends XPPurchasable
{
    constructor(name, min)
    {
        super(name, min);
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
},{"./XPPurchasable":4}],6:[function(require,module,exports){
const Character = require('./Character');
(($)=>{
    /**
     * @type {Character}
     */
    let toon = null;
    function setPurchasableLevel()
    {
        let $span = $(this),
            level = parseInt($span.data('level')),
            $parentCol = $span.closest('.col'),
            purchasableName = $parentCol.data('purchasable'),
            purchasable = toon.lookups[purchasableName];
        // determine what level we're setting, what it's at, and what to do about any differences
        if(level == purchasable.level && level > purchasable.min)
        {
            level --;
        }
        purchasable.level = level;
        if(level)
        {
            $(`span:lt(${level})`, $parentCol).html('<i class="fas fa-circle"></i>');
            $(`span:gt(${level - 1})`, $parentCol).html('<i class="far fa-circle"></i>');
        }
        else
        {
            $(`span`, $parentCol).html('<i class="far fa-circle"></i>');
        }
        saveCharacter();
    }

    function saveCharacter()
    {
        $.post(
            '/characters/save/',
            {reference:toon.reference, json:JSON.stringify(toon.toJSON())},
            (response)=>{
                console.log(response);
            }
        );
    }


    $(()=> {
        toon = Character.fromJSON(rawCharacterJSON);
        $('.simplePurchasable').click(setPurchasableLevel);
    });

})(window.jQuery);
},{"./Character":3}]},{},[6]);
