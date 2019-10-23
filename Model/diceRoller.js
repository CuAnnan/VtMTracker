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