(($)=>{
    function idRequestFollowUp($button, approve)
    {
        return new Promise(
            (resolve, reject)=>{
                let $col = $button.closest('.col'),
                    requestReference = $col.data('requestId'),
                    $row = $col.closest('.row');
                $.post(
                    '/users/requestFollowUp',
                    {
                        requestReference:requestReference,
                        approve:approve
                    },
                    function(response)
                    {
                        $row.remove();
                        resolve();
                    }
                );
            }
        );
    }

    $(()=>{
        $('.approveIDButton').click(function(){
            idRequestFollowUp($(this), true).then();
        });
        $('.rejectIDButton').click(function(){
            idRequestFollowUp($(this), false).then();
        });
    });
})(window.jQuery);