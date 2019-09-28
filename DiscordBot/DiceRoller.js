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

        if(this.result == 1)
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

class Action
{
    constructor(pool, difficulty, specialty)
    {
        this.pool = pool?pool:1;
        this.difficulty = difficulty?difficulty:6;
        this.specialty = specialty?specialty:false;
        this.botch = false;
        this.performed = false;
        this.dice = [];
        this.successes = 0;
        this.diceValues = [];
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
        if(this.performed)
        {
            return this;
        }

        let hasOnes = false;

        for(let i = 0; i < this.pool; i++)
        {
            let die = new Die(this.difficulty, this.specialty).roll();
            if(die.result == -1)
            {
                hasOnes = true;
            }
            this.diceValues.push(die.result);
            this.successes += die.successes;
            this.dice.push(die);
        }
        if(this.successes == 0 && hasOnes)
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
            pool:this.pool,
            diceValues:this.diceValues
        };
    }
}

module.exports = {Action:Action};