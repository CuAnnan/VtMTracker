var postLoginFunctions = postLoginFunctions?postLoginFunctions:[],
    postLogoutFunctions = postLogoutFunctions?postLogoutFunctions:[];


(($)=>{
    $(()=>{
        $newCharacterModal = $('#newCharacterModal');
        $('#new-character-button').click(()=>{$newCharacterModal.modal('show')});
        $('#characterCreateButton').click(addNewCharacter);
    });

    function addNewCharacter()
    {
        $.post(
            '/characters/new',
            {
                clan:$('#clan').val(),
                name:$('#name').val()
            },
            (response)=>{
                window.location.replace(`/characters/load/${response.reference}`);
            }
        );
    }

    postLoginFunctions.push(
        function()
        {
            console.log('Calling post login function');
        }
    );
    postLogoutFunctions.push(
        function()
        {
            console.log('Calling post logout function');
        }
    );


})(window.jQuery);