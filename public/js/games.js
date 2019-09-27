(($)=>{
    let $gameModal = $('#newGameModal');
    $(()=>{

        $('#newGameButton').click(()=>{$gameModal.modal('show')});
        $('#gameCreateButton').click(()=>{
            $.post(
                '/games/new',
                {name:$('#gameName').val()},
                function(response)
                {
                    window.location.replace(`/games/show/${response.reference}`);
                }
            );

        });
    });
})(window.jQuery);