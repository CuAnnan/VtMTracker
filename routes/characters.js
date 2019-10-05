const   express = require('express');
        router = express.Router(),
        Controller = require('../Controllers/CharacterController');

router.get('/', (req, res, next)=>Controller.indexAction(req, res).catch(next));
router.get('/load/:reference', (req, res, next)=>Controller.loadAction(req, res).catch(next));
router.get('/view/:reference', (req, res, next)=>Controller.loadAction(req, res).catch(next));
router.get('/history/:reference', (req, res, next)=>Controller.buildHistoryAction(req, res).catch(next));

router.post('/new/', (req, res, next)=>Controller.newCharacterAction(req, res).catch(next));
router.post('/save/', (req, res, next)=>Controller.saveAction(req, res).catch(next));
router.post('/about/', (req, res, next)=>Controller.aboutAction(req, res).catch(next));


module.exports = router;