const   DiscordBot = require('extensiblediscordbot'),
        {Action} = require('./DiceRoller');

class WoDDiceBot extends DiscordBot
{
    constructor(conf)
    {
        super(conf);
    }

    async hoist(client)
    {
        let settings = await super.hoist(client);
        this.attachCommands();
        return settings;
    }

    attachCommands()
    {
        super.attachCommands();
        this.attachCommand('roll', this.simpleRoll);
        this.attachCommand('help', this.displayHelpText);
    }

    displayHelpText(commandParts, message)
    {
        message.reply([
            "`!roll <n> [diff-<d>] [spec]`",
            "    `!roll 5 would` roll five dice at the standard difficulty of 6",
            "    `!roll 6 diff-7` would roll six dice but only consider 7s a success",
            "    `!roll 7 spec` would roll 7 dice and consider tens two successes",
            "    `!roll 7 diff-7 -- rolling strength + brawl` would treat the text after the double dashes as a comment which is for the sake of posterity"
        ]);
    }

    preParseRoll(messageText)
    {
        let difficulty = 6,
            difficultyMatch = messageText.match(/diff\-(\d+)/),
            specialty = messageText.indexOf('spec')>-1;
        return {
            difficulty:difficultyMatch?difficultyMatch:difficulty,
            specialty:specialty
        }
    }

    simpleRoll(commandParts, message, comment)
    {
        let messageText = message.content.toLowerCase(),
            poolMatch = messageText.match(/\s(\d+)\s?/),
            {difficulty, specialty} = this.preParseRoll(messageText),
            pool = 5;

        if(poolMatch)
        {
            pool = parseInt(poolMatch[1]);
        }

        let action = new Action(pool, difficulty, specialty);
        let results = action.getResults();
        this.displayResults(message, results, comment);
    }

    displayResults(message, results, comment)
    {
        let response = [`You rolled ${results.pool} dice at a difficulty of ${results.difficulty}.`];
        if(comment)
        {
            response.push(`Comment provided: ${comment}`);
        }
        if(results.specialty)
        {
            response.push("It was considered a specialty roll.");
        }
        if(results.botch)
        {
            response.push('You botched!');
        }
        else
        {
            response.push(`You got ${results.successes} successes.`);
        }

        let diceRolled = [];
        for(let dieRoll of results.dice)
        {
            let die = dieRoll.result;
            if(die >= results.difficulty)
            {
                if(die === 10 && results.specialty)
                {
                    diceRolled.push(`***${die}***`);
                }
                else
                {
                    diceRolled.push(`**${die}**`);
                }
            }
            else if(die === 1)
            {
                diceRolled.push(`__${die}__`);
            }
            else
            {
                diceRolled.push(die);
            }
        }
        response.push('Dice rolled: ['+diceRolled.join(', ')+']');
        message.reply(response);
    }
}

module.exports = WoDDiceBot;