const   Character = require('./Character'),
        Road = require('./Road');
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
            purchasable = toon.lookups[purchasableName],
            fullClassName = 'fas fa-circle',
            emptyClassName = 'far fa-circle',
            data = $parentCol.data();

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
        console.log(level);

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


    $(()=> {
        window.toon = toon = Character.fromJSON(rawCharacterJSON);
        $('.simplePurchasable').click(setPurchasableLevel);
        let $roadsSelect = $('#roadsSelect').change(setRoad);
    });

})(window.jQuery);