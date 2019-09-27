function getMongooseURI(data)
{
    let user = data.user?encodeURIComponent(data.user):'',
        pwd = data.pwd?':'+encodeURIComponent(data.pwd):'',
        host = data.host?data.host:'localhost',
        port = data.port?data.port:'27017',
        db = data.db?data.db:''

    return `mongodb://${user}${pwd}@${host}:${port}/${db}`;
}

module.exports = {
    mongoose:{
        user:'vtm_dba',
        pwd:'vtm_dba_pwd::12345::potato::SALAD::malkavian',
        db:'wing_vtm_db',
        getURI:function(){
            return getMongooseURI(this);
        }
    },
    sessionStore:{
        user:'vtn_session_database_dba',
        pwd:'session_database_pwd_#12345#fish#sandwich#AMSTERDAM',
        db:'connect_mongodb_sessions',
        getURI:function(){
            return getMongooseURI(this)
        }
    },
    discordBot:{
        clientToken:'NTI4MDA0MTc2MTIzNTI3MTc5.XNzeKA.iNMrdROz19pADQFdRO3V1vcfQgQ',
        commandPrefix:'!',
        'storyTellerRoleName':'@StoryTeller'
    }
};
