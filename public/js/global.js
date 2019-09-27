var postLoginFunctions = postLoginFunctions?postLoginFunctions:[],
    postLogoutFunctions = postLogoutFunctions?postLogoutFunctions:[];

(($)=>{
    let $loginModal, $loginPassword, $loginEmail;

    function showLoginModal()
    {
        $loginModal.modal('show');
    }

    function login()
    {
        $.post('/users/login',{email:$loginEmail.val(), password:$loginPassword.val()}, function(response){
            if(response.success)
            {
                $('#logged-in-username').text(`${response.displayName}#${response.id}`);
                $('.loginLink').toggle();
                $loginModal.modal('hide');
                for(let postLoginFunction of postLoginFunctions)
                {
                    postLoginFunction();
                }
            }
        });
    }

    function logout()
    {
        $.post('/users/logout', function(response){
            $('.loginLink').toggle();
            for(let postLogoutFunction of postLogoutFunctions)
            {
                postLogoutFunction();
            }
        });
    }

    $(()=>{
        $loginModal = $('#loginModal');
        $loginEmail = $('#login-email');
        $loginPassword = $('#login-password');
        $('#loginLink').click(showLoginModal);
        $('#logoutLink').click(logout);
        $('#login-button').click(login);
    });
})(window.jQuery);