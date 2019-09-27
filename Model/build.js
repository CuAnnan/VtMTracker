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