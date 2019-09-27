module.exports = {
    password:function(password, passwordConfirmation)
    {
        if(password !== passwordConfirmation)
        {
            return 'Password strings do not match';
        }
        if(password.length < 8)
        {
            return 'Passwords must be at least 8 characters long';
        }
        else if(password.length < 13 && !(password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^a-z^A-Z\d]/)))
        {
            return 'Passwords with fewer than 13 characters must have at least one upper case letter, one lower case letter, one number, and one character that is not a letter or number';
        }
        else if(password.length < 16 && !(password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/)))
        {
            return 'Passwords with fewer than 13 characters must have at least one upper case letter, one lower case letter, and one number';
        }
        else if(password.length < 20 && !(password.match(/[a-z]/) && password.match(/[A-Z]/)))
        {
            return 'Passwords with fewer than 13 characters must have at least one upper case letter, and one lower case letter';
        }
        return null;
    }
};