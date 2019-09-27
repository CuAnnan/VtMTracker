(($)=>{
    function removeCharacter()
    {
        let $button = $(this),
            characterReference = $button.data('characterReference'),
            gameReference = $button.data('gameReference'),
            $row = $button.closest('.row');
        $.post(
            `/games/removeCharacter/`,
            {
                characterReference:characterReference,
                gameReference:gameReference
            },
            function(response)
            {
                console.log(response);
                if(response.success)
                {
                    $row.remove();
                }
            }
        );
    }

    function removePlayer()
    {
        let $button = $(this),
            gameReference = $button.data('gameReference'),
            playerReference = $button.data('playerReference');
        $.post(
            '/games/removePlayer/',
            {
                playerReference:playerReference,
                gameReference:gameReference
            },
            function(response)
            {
                console.log(response);
            }
        );
    }

    $(()=>{
        $('.removeCharacterButton').click(removeCharacter);
        $('.playerRemoveButton').click(removePlayer);
    });
})(window.jQuery);