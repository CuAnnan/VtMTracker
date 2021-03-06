const   Attribute = require('./Attribute'),
        Ability = require('./Ability'),
        Road = require('./Road'),
        Virtue = require('./Virtue'),
        {Discipline, DisciplinePower} = require('./Discipline'),
        XPPurchasable = require('./XPPurchasable'),
        Spendable = require('./Spendable'),
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

        this.nature = null;
        this.demeanour = null;

        this.willpower = new Spendable('Willpower', 0);
        this.bloodpool = new Spendable('Bloodpool', 0);

        this.attributes = {};
        this.unsortedAttributes = [];
        this.lookups = {};
        this.abilities = {};
        this.unsortedAbilities = [];

        for(let useGroup in attributes)
        {
            this.attributes[useGroup] = [];
            for(let attributeName of attributes[useGroup])
            {
                let attribute = new Attribute(attributeName);
                this.attributes[useGroup].push(attribute);
                this.unsortedAttributes.push(attribute);
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
                this.unsortedAbilities.push(ability);
                this.lookups[abilityName.toLowerCase()] = ability;
            }
        }

        this.disciplines = {};

        this.courage = new Virtue('courage', 0, 5);
        this.lookups.courage = this.courage;
        this.lookups.bloodpool = this.bloodpool;
        this.lookups.willpower = this.willpower;
    }


    set road(road)
    {
        if(this._road)
        {
            delete this.lookups[this.virtue1.name];
            delete this.lookups[this.virtue2.name];
        }
        this._road = road;
        this.aura = this._road.aura;
        this.virtue1 = this._road.virtue1;
        this.virtue2 = this._road.virtue2;
        this.lookups[this.virtue1.name] = this.virtue1;
        this.lookups.virtue1 = this.virtue1;
        this.lookups[this.virtue2.name] = this.virtue2;
        this.lookups.virtue2 = this.virtue2;
        this.lookups.road = road;
    }

    get road()
    {
        return this._road;
    }

    addDiscipline(discipline)
    {
        if(!this.disciplines[discipline.name])
        {
            this.disciplines[discipline.name] = discipline;
            this.lookups[discipline.name.toLowerCase()] = discipline;
        }

        return this;
    }

    removeDiscipline(discipline)
    {
        delete this.disciplines[discipline.name];
    }


    getDisciplineByName(disciplineName)
    {
        return this.disciplines[disciplineName];
    }

    toJSON()
    {
        let json = {
            name:this.name,
            clan:this.clan,
            demeanour:this.demeanour,
            nature:this.nature,
            reference:this.reference,
            abilities:this.unsortedAbilities,
            attributes:this.unsortedAttributes,
            courage:this.courage,
            bloodpool:this.bloodpool,
            willpower:this.willpower,
            disciplines:[],
        };
        for(let discipline of Object.values(this.disciplines))
        {
            if(discipline.level)
            {
                json.disciplines.push(discipline.toJSON());
            }
        }
        if(this.road)
        {
            json.road = this.road;
        }
        return json;
    }

    static fromJSON(json)
    {
        let character = new Character(json.name, json.clan, json.reference);
        if (json.road) {
            let road = Road.fromJSON(json.road);
            character.road = road;
        }
        if(json.demeanour)
        {
            character.demeanour = json.demeanour;
        }
        if(json.nature)
        {
            character.nature = json.nature;
        }
        if(json.courage)
        {
            character.lookups.courage.loadJSON(json.courage);
        }
        for (let lookup of Object.values(json.abilities)) {
            character.lookups[lookup.name.toLowerCase()].loadJSON(lookup);
        }
        for (let lookup of Object.values(json.attributes)) {
            character.lookups[lookup.name.toLowerCase()].loadJSON(lookup);
        }
        if(json.bloodpool)
        {
            character.lookups.bloodpool.loadJSON(json.bloodpool);
        }
        if(json.willpower)
        {
            character.lookups.willpower.loadJSON(json.willpower);
        }
        if(json.disciplines)
        {
            for(let discipline of json.disciplines)
            {
                character.addDiscipline(Discipline.fromJSON(discipline));
            }
        }

        return character;

    }
}

module.exports = Character;