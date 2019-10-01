const   Discord = require('discord.js'),
        client = new Discord.Client(),
        DieBot = require('./ServerBot');
let     dieBot = null;

function logBotIn(conf)
{
    return new Promise(
        (resolve, reject)=>{
            let discordBotConf = conf.discordBot;

            client.login(discordBotConf.clientToken);
            client.once('ready',()=>{
                console.log('Hoisting the die bot');
                dieBot = DieBot.instantiateStaticBot(discordBotConf).hoist(client);
                resolve();
            });
            client.on('error',(error)=>{
                console.log(error);
            });
        }
    );
}

module.exports = {hoist:async function(conf)
{
    await logBotIn(conf);

    process.on(
        'SIGINT',
        ()=>{
            DieBot.getStaticInstance().shutdown().then(
                ()=>{
                    client.destroy();
                    process.exit();
                }
            );
        }
    );

    process.on('unhandledRejection', console.error);
    return dieBot;
}};