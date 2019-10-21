const   Character = require('./Character'),
        Road = require('./Road');
(($)=>{
    /**
     * @type {Character}
     */
    let toon = null,
        $disciplineLabel = $('#disciplineMenuLabel'),
        $disciplineName = $('#disciplineName'),
        $disciplineLevel = $('#disciplineLevel');

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
        $disciplineName.text(discipline);
        if(toon.disciplines[discipline])
        {
            console.log(toon.disciplines[discipline]);
        }
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