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
            // an unskilled knowledge can't be rolled without ST approval so just stick the diff penalty
            // to ten and the die roller will know it can't be don
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