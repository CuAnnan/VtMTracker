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
},{"./XPPurchasableWithSpeciality":9}],2:[function(require,module,exports){
const XPPurchasableWithSpecialty = require('./XPPurchasableWithSpeciality');

class Attribute extends XPPurchasableWithSpecialty
{
    constructor(name)
    {
        super(name, 1);
    }

}

module.exports = Attribute;
},{"./XPPurchasableWithSpeciality":9}],3:[function(require,module,exports){
const   Attribute = require('./Attribute'),
        Ability = require('./Ability'),
        Road = require('./Road'),
        Virtue = require('./Virtue'),
        Discipline = require('./Discipline'),
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
        };
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
},{"./Ability":1,"./Attribute":2,"./Discipline":4,"./Road":5,"./Spendable":6,"./Virtue":7,"./XPPurchasable":8}],4:[function(require,module,exports){
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
},{"./XPPurchasable":8}],5:[function(require,module,exports){
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
},{"./Virtue":7,"./XPPurchasable":8,"./roadsData":11}],6:[function(require,module,exports){
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
},{"./XPPurchasable":8}],7:[function(require,module,exports){
const XPPurchasable = require('./XPPurchasable');

class Virtue extends XPPurchasable
{
    constructor(name)
    {
        super(name, 0, 5);
    }


}

module.exports = Virtue;
},{"./XPPurchasable":8}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{"./XPPurchasable":8}],10:[function(require,module,exports){
const   Character = require('./Character'),
        Road = require('./Road');
(($)=>{
    /**
     * @type {Character}
     */
    let toon = null,
        $disciplineLabel = $('#disciplineMenuLabel');

    function setPurchasableLevel()
    {
        let $span = $(this),
            level = parseInt($span.data('level')),
            $parentCol = $span.closest('.col'),
            purchasableName = $parentCol.data('purchasable'),
            purchasable = toon.lookups[purchasableName],
            fullClassName = 'fas fa-circle',
            emptyClassName = 'far fa-circle',
            data = $parentCol.data();

        let changeData = {
            name:purchasable.name,
            oldLevel:purchasable.level
        };

        if(data.fullClassName)
        {
            fullClassName = data.fullClassName;
        }
        if(data.emptyClassName)
        {
            console.log('Overwrite the fucking class name');
            emptyClassName = data.emptyClassName;
        }

        if(!(purchasable && purchasableName))
        {
            return;
        }
        // determine what level we're setting, what it's at, and what to do about any differences
        if(level == purchasable.level && level > purchasable.min)
        {
            level --;
        }
        purchasable.level = level;
        changeData.newLevel = level;

        if(level)
        {
            console.log(emptyClassName);
            $(`span:lt(${level})`, $parentCol).html(`<i class="${fullClassName}"></i>`);
            $(`span:gt(${level - 1})`, $parentCol).html(`<i class="${emptyClassName}"></i>`);
        }
        else
        {
            $(`span`, $parentCol).html(`<i class="${emptyClassName}"></i>`);
        }

        if(purchasableName === 'willpower')
        {
            let $wpContainer = $('#willpowerContainer');
            $(`span:lt(${level})`, $wpContainer).html(`<i class="far fa-square"></i>`);
            $(`span:gt(${level - 1})`, $wpContainer).html(`<i class="fas fa-square"></i>`);
        }

        saveCharacter(changeData);
    }

    function saveCharacter(changeData)
    {
        $.post(
            '/characters/save/',
            {reference:toon.reference, json:JSON.stringify(toon.toJSON()), changeData:JSON.stringify(changeData)},
            (response)=>{
                console.log(response);
            }
        );
    }

    function setRoad()
    {
        let $select = $(this),
            name = $select.val();
        if(name)
        {
            let road = Road.byName(name);
            toon.road = road;
            $('#virtue1Name').text(road.virtue1.name);
            $('#virtue2Name').text(road.virtue2.name);
        }
        else
        {
            toon.road = null;
        }
        saveCharacter();
    }

    function showDisciplineUI()
    {
        $('#disciplineModal').modal('show');
    }

    function chooseDiscipline()
    {
        let $link = $(this),
            discipline = $link.data('disciplineName');
        $disciplineLabel.text(discipline);
    }

    function loadDisciplineUI()
    {
        let $disciplineDDM = $('#disciplineDropDownMenu');

        for(let discipline of disciplineNames)
        {
            $(`<a class="dropdown-item" data-discipline-name="${discipline}" data-target="#">${discipline}</a>`)
                .appendTo($disciplineDDM)
                .click(chooseDiscipline);
        }
    }


    $(()=> {
        window.toon = toon = Character.fromJSON(rawCharacterJSON);
        loadDisciplineUI();
        $('.simplePurchasable').click(setPurchasableLevel);
        $('#disciplineHR').click(showDisciplineUI);
        let $roadsSelect = $('#roadsSelect').change(setRoad);
    });

})(window.jQuery);
},{"./Character":3,"./Road":5}],11:[function(require,module,exports){
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
},{}]},{},[10]);
