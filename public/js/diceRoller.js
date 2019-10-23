(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class Die
{
    constructor(difficulty, specialty)
    {
        this.difficulty = difficulty?difficulty:6;
        this.specialty = specialty?specialty:false;
        this.rolled = false;
        this.successes = 0;
        this.result = 0;
    }

    roll()
    {
        if(this.rolled)
        {
            return this;
        }

        this.successes = 0;
        this.result = Math.floor(Math.random() * 10) + 1;

        if(this.result === 1)
        {
            this.successes = -1;
        }
        else if(this.result >= this.difficulty)
        {
            this.successes = (this.result == 10 && this.specialty)?2:1;
        }
        this.rolled = true;
        return this;
    }

    toJSON()
    {
        return {
            difficulty:this.difficulty,
            successes:this.successes,
            specialty:this.specialty,
            result:this.result,
            rolled:this.rolled
        };
    }
}

class Pool
{
    constructor(difficulty)
    {
        this.factors = {};
        this.value = 0;
        this.penalties = {};
        this.baseDifficulty = difficulty?difficulty:6;
    }

    get difficulty()
    {
        let penalty = 0;
        for(let factorPenalty of Object.values(this.penalties))
        {
            penalty = Math.max(penalty, factorPenalty);
        }
        return this.baseDifficulty + penalty;
    }

    addFactor(factor)
    {
        if(this.factors[factor.name])
        {
            return this;
        }

        if(factor.penalty)
        {
            this.penalties[factor.name] = factor.penalty;
        }

        this.factors[factor.name] = factor;
        this.value += factor.level;
        return this;
    }

    removeFactor(factor)
    {
        if(this.factors[factor.name])
        {
            let factorLevel = this.factors[factor.name].level;
            delete this.factors[factor.name];
            delete this.penalties[factor.name];
            this.value -= factorLevel;
        }
        return this;
    }
}

class Action
{
    constructor(pool, difficulty, specialty, willpower, factors)
    {
        this.pool = pool?pool:1;
        this.difficulty = difficulty?difficulty:6;
        this.specialty = specialty?specialty:false;
        this.willpower = willpower?willpower:false;
        this.botch = false;
        this.performed = false;
        this.dice = [];
        this.factors = [];
        this.successes = 0;
        this.diceValues = [];
    }

    static getActionForPool(pool, specialty, willpower)
    {
        return new Action(pool.value, pool.difficulty, specialty, willpower, pool.factors);
    }

    perform()
    {
        if(this.performed)
        {
            return this;
        }
        this.rollDice();
        this.performed = true;
        return this;
    }


    rollDice()
    {
        if (this.performed)
        {
            return this;
        }

        let hasOnes = false;

        for (let i = 0; i < this.pool; i++)
        {
            let die = new Die(this.difficulty, this.specialty).roll();
            if (die.result === 1)
            {
                hasOnes = true;
            }
            this.diceValues.push(die.result);
            this.successes += die.successes;
            this.dice.push(die);
        }

        if (this.willpower)
        {
            if (this.successes < 0)
            {
                this.successes = 0;
            }
            this.successes++;
        }

        this.successes = Math.max(this.successes, 0);

        if(this.successes === 0 && hasOnes)
        {
            this.botch = true;
        }

        return this;
    }

    getResults()
    {
        this.perform();
        return {
            successes:this.successes,
            botch:this.botch,
            dice:this.dice,
            difficulty:this.difficulty,
            speciality:this.specialty,
            willpower:this.willpower,
            pool:this.pool,
            diceValues:this.diceValues,
            factors:this.factors
        };
    }
}

module.exports = {Action:Action, Pool:Pool};
},{}],2:[function(require,module,exports){
const XPPurchasableWithSpecialty  = require('./XPPurchasableWithSpeciality');

class Ability extends XPPurchasableWithSpecialty
{
    constructor(name, unskilledPenalty)
    {
        super(name, 0);
        this.unskilledPenalty = unskilledPenalty;
    }

    get penalty()
    {
        if(this.level)
        {
            return 0;
        }
        return this.unskilledPenalty;
    }

}

module.exports = Ability;
},{"./XPPurchasableWithSpeciality":10}],3:[function(require,module,exports){
const XPPurchasableWithSpecialty = require('./XPPurchasableWithSpeciality');

class Attribute extends XPPurchasableWithSpecialty
{
    constructor(name)
    {
        super(name, 1);
    }

}

module.exports = Attribute;
},{"./XPPurchasableWithSpeciality":10}],4:[function(require,module,exports){
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
},{"./Ability":2,"./Attribute":3,"./Discipline":5,"./Road":6,"./Spendable":7,"./Virtue":8,"./XPPurchasable":9}],5:[function(require,module,exports){
const XPPurchasable = require('./XPPurchasable');

class DisciplinePower
{
    constructor(name, poolFactors, level, cost)
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
    constructor(name, bought)
    {
        super(name, 0);
        this.bought = bought;
        this.powers = {};
    }

    toJSON()
    {
        let json = super.toJSON();
        json.powers = [];
        let powers = Object.values(this.powers);
        for(let i = 0; i < this.level; i++)
        {
            let powerList = powers[i];
            if(powerList)
            {
                for (let power of powerList)
                {
                    json.powers.push(power.toJSON());
                }
            }
        }
        return json;
    }

    addPower(power)
    {
        if(!this.powers[power.level])
        {
            this.powers[power.level] = [];
        }
        this.powers[power.level].push(power);
    }

    static fromJSON(json)
    {
        let discipline = new Discipline(json.name, json.bought);
        for(let power of json.powers)
        {
            discipline.addPower(DisciplinePower.fromJSON(power));
        }
        return discipline;
    }

}

module.exports = {Discipline:Discipline, DisciplinePower:DisciplinePower};
},{"./XPPurchasable":9}],6:[function(require,module,exports){
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
},{"./Virtue":8,"./XPPurchasable":9,"./roadsData":12}],7:[function(require,module,exports){
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

module.exports = Spendable;
},{"./XPPurchasable":9}],8:[function(require,module,exports){
const XPPurchasable = require('./XPPurchasable');

class Virtue extends XPPurchasable
{
    constructor(name)
    {
        super(name, 0, 5);
    }


}

module.exports = Virtue;
},{"./XPPurchasable":9}],9:[function(require,module,exports){
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
        return {
            name:this.name,
            min:this.min,
            bought:this.bought
        };
    }

    loadJSON(json)
    {
        this.name = json.name;
        this.min = json.min;
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
},{}],10:[function(require,module,exports){
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
},{"./XPPurchasable":9}],11:[function(require,module,exports){
const   Character = require('./Character'),
        {Action ,Pool} = require('../DiscordBot/DiceRoller');
//IIFE
(($)=>{
    let $successesRow = $successesCol = $botchRow = $willPowerCol = $specialtyCol = $addedPoolFactors= $poolTotal= toon = pool = null;

    function rollDice()
    {
        let action = null;
        if(pool.value)
        {
            action = Action.getActionForPool(
                pool,
                $('input[name="specialty"]:checked').val() === 'yes',
                $('input[name="willpower"]:checked').val() === 'yes'
            );
        }
        else
        {
            action = new Action(
                parseInt($('#dice-pool').val()),
                parseInt($('#difficulty').val()),
                $('input[name="specialty"]:checked').val() === 'yes',
                $('input[name="willpower"]:checked').val() === 'yes'
            );
        }
        let result = action.getResults();

        $successesCol.text(result.successes);
        $willPowerCol.text(result.willpower?'Yes':'No');

        $('#result-specialty').text(result.speciality?'Yes':'No');
        let html = [];

        if(result.botch)
        {
            $successesRow.hide();
            $botchRow.show();
        }
        else
        {
            $successesRow.show();
            $botchRow.hide();
        }

        for(let roll of result.diceValues)
        {
            if(roll === 1)
            {
                html.push(`<i>${roll}</i>`);
            }
            else if(roll == 10 && result.specialty)
            {
                html.push(`<b><u>${roll}</u></b>`);
            }
            else if(roll >= result.difficulty)
            {
                html.push(`<u>${roll}</u>`);
            }
            else
            {
                html.push(`<span>${roll}</span>`);
            }
        }
        $('#result-rolls').html(html.join(', '));
    }

    function addFactorToPool()
    {
        let $node = $(this),
            val = $node.val();

        if($node.attr('type') === 'number')
        {
            pool
                .removeFactor({name:'Flat Bonus'})
                .addFactor({name:'Flat Bonus', level:parseInt(val)});
        }
        else
        {
            pool.addFactor(toon.lookups[val.toLowerCase()]);
        }
        $node.val('');
        updatePoolFactors();
    }

    function updatePoolFactors()
    {
        let html = '';
        let rawPool = '';
        for(let factor of Object.values(pool.factors))
        {
            html += `<button class="btn-primary btn removeFactorButton" data-level="${factor.level}" data-name="${factor.name}">${factor.name}</button>`
            rawPool += `${factor.name}, `;
        }
        rawPool = rawPool.substr(0, rawPool.length - 2);

        $addedPoolFactors.html(html);
        $('#poolContributions').html(rawPool);
        if(pool.value)
        {
            $('#dice-pool').val(pool.value);
        }
        $poolTotal.html(pool.value);
        $('.removeFactorButton').on('click', removeFactorFromPool);
    }

    function removeFactorFromPool()
    {
        let $button = $(this),
            data = $button.data();
        pool.removeFactor(data);
        updatePoolFactors();
    }

    function showPoolModal()
    {
        $('#poolModal').modal('show');
        updatePoolFactors();
    }


    // window load event
    $(()=>{
        pool = new Pool();
        $successesRow = $('#successes-row');
        $successesCol =$('#result-successes');
        $botchRow = $('#botch-row');
        $willPowerCol = $('#result-willpower');
        $specialtyCol = $('#result-specialty');
        $addedPoolFactors = $('#addedPoolFactors');
        $poolTotal = $('#poolTotal');
        toon = Character.fromJSON(characterJSON);
        $('#poolButton').click(showPoolModal);
        $('.poolFactor').change(addFactorToPool);
        $('#roll-button').click(rollDice);
    });

})(window.jQuery);
},{"../DiscordBot/DiceRoller":1,"./Character":4}],12:[function(require,module,exports){
let roads = [
    ['Beast', 'Conviction', 'Instinct', 'Menace'],
    ['Hunter', 'Conviction', 'Instinct', 'Menace'],
    ['Journeys', 'Conviction', 'Self-Control', 'Menace'],
    ['Liberation', 'Conviction', 'Instinct', 'Menace'],
    ['Heaven', 'Conscience', 'Self-Control', 'Holiness'],
    ['Christ', 'Conscience', 'Self-Control', 'Holiness'],
    ['Life', 'Conscience', 'Self-Control', 'Holiness'],
    ['Humanity', 'Conscience', 'Self-Control', 'Humanity'],
    ['Breath', 'Conscience', 'Self-Control', 'Humanity'],
    ['Community', 'Conscience', 'Self-Control', 'Humanity'],
    ['Illumination', 'Conscience', 'Self-Control', 'Humanity'],
    ['Kings', 'Conviction', 'Self-Control', 'Command'],
    ['Chivalry', 'Conscience', 'Self-Control', 'Command'],
    ['Devaraja', 'Conviction', 'Self-Control', 'Command'],
    ['Daena', 'Conviction', 'Self-Control', 'Command'],
    ['Lilith', 'Conviction', 'Instinct', 'Carved and Bleeding'],
    ['Thorns', 'Conviction', 'Instinct', 'Carved and Bleeding'],
    ['Veils', 'Conviction', 'Instinct', 'Carved and Bleeding'],
    ['Making', 'Conviction', 'Instinct', 'Carved and Bleeding'],
    ['Metamorphosis', 'Conviction', 'Instinct', 'Inhumanity'],
    ['Sin', 'Conviction', 'Instinct', 'Temptation'],
    ['Pleasure', 'Conviction', 'Instinct', 'Temptation'],
    ['Devil', 'Conviction', 'Instinct', 'Temptation'],
    ['Screams', 'Conviction', 'Instinct', 'Temptation'],
    ['Bones', 'Conviction', 'Self-Control', 'Silence'],
    ['Yasa', 'Conviction', 'Self-Control', 'Trust']
];

module.exports = roads;
},{}]},{},[11]);
