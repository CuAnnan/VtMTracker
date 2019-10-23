const   Character = require('./Character'),
        {Discipline, DisciplinePower} = require('./Discipline'),
        Road = require('./Road');
(($)=>{
    /**
     * @type {Character}
     */
    let toon = null,
        $disciplineLabel = $('#disciplineMenuLabel'),
        $disciplineName = $('#disciplineName'),
        $disciplineList = $('#disciplineList'),
        $disciplineRow = $('#disciplineRow'),
        /**
         * @type {Discipline}
         */
        currentDiscipline = null;

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
        $disciplineRow.hide();
        $('#disciplineModal').modal('show');
    }

    function chooseDiscipline()
    {
        let $link = $(this),
            disciplineName = $link.data('disciplineName');
        $disciplineLabel.text(disciplineName);
        $disciplineName.text(disciplineName);
        $disciplineRow.show();

        let discipline = toon.getDisciplineByName(disciplineName);
        if(!discipline)
        {
            try
            {
                discipline = Discipline.fromJSON(disciplineJSON[disciplineName]);
            }
            catch(e)
            {
                discipline = new Discipline(disciplineName);
            }
            toon.addDiscipline(discipline);
        }
        currentDiscipline = discipline;
        updateDisciplineDots();
    }

    function updateDisciplineDots()
    {
        $('.disciplineLevel').removeClass('fas').addClass('far');
        $(`.disciplineLevel:lt(${currentDiscipline.level})`).removeClass('far').addClass('fas');
    }

    function setDisciplineLevel()
    {
        let $span = $(this),
            level = $span.data('level');
        let changeData = {name:currentDiscipline.name, oldLevel:currentDiscipline.level};
        currentDiscipline.level = (level === currentDiscipline.level)?level-1:level;
        changeData.newLevel = currentDiscipline.level;
        updateDisciplineDots();
        saveCharacter(changeData);
    }

    function updateDisciplineList()
    {
        $disciplineList.empty();
        let characterDisciplines = Object.values(toon.disciplines);
        for(let discipline of characterDisciplines)
        {
            if(discipline.level)
            {
                let html = `<div class="row"><div class="col-5">${discipline.name}</div><div class="col">`;

                for(let i = 0; i < 9; i++)
                {
                    html += `<span class="inlineDisciplineLevelSpan" data-level="${i+1}"><i class="inlineDisciplineLevel fa-circle ${i<discipline.level?'fas':'far'}"></i></span>`;
                }
                html += '</div></div>';
                $(html).appendTo($disciplineList).data('disciplineName', discipline.name);
            }
            else
            {
                toon.removeDiscipline(discipline);
            }
        }
        $('.inlineDisciplineLevelSpan').click(setInlineDisciplineLevel);
    }

    function setInlineDisciplineLevel()
    {
        let $span = $(this),
            $row = $span.closest('.row'),
            $col = $span.closest('.col'),
            level = parseInt($span.data('level')),
            data = $row.data();
        let discipline = toon.getDisciplineByName(data.disciplineName);
        let changeData = {name:discipline.name, oldLevel:discipline.level};
        discipline.level = level === discipline.level?level - 1:level;
        changeData.newLevel = discipline.level;
        $('.inlineDisciplineLevel', $col).removeClass('far fas');
        if(discipline.level)
        {
            $(`.inlineDisciplineLevel:lt(${discipline.level})`, $col).addClass('fas');
            $(`.inlineDisciplineLevel:gt(${discipline.level - 1})`, $col).addClass('far');
        }
        else
        {
            $('.inlineDisciplineLevel', $col).addClass('far');
        }
        saveCharacter(changeData);
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
        $('.disciplineLevelContainer').click(setDisciplineLevel);
        $('#disciplineHR').click(showDisciplineUI);
        $('#disciplineModal').on('hide.bs.modal', updateDisciplineList);
        $('.inlineDisciplineLevelSpan').click(setInlineDisciplineLevel);
        let $roadsSelect = $('#roadsSelect').change(setRoad);
    });

})(window.jQuery);