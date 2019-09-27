const express = require('express'),
    router = express.Router(),
    Controller = require('../Controllers/GameController');

router.get('/', (req, res, next) => Controller.indexAction(req, res).catch(next));
router.post('/new/', (req, res, next)=> Controller.newAction(req, res).catch(next));
router.get('/show/:reference', (req, res, next)=> Controller.showAction(req, res).catch(next));
router.get('/invite/:reference', (req, res, next)=>Controller.inviteAction(req, res).catch(next));
router.post('/join/:reference', (req, res, next)=>Controller.joinAction(req, res).catch(next));
router.post('/removeCharacter/', (req, res, next)=>Controller.removeCharacterAction(req, res).catch(next));
router.post('/removePlayer/', (req, res, next)=>Controller.removePlayerAction(req, res).catch(next));

module.exports = router;
