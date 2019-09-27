const express = require('express'),
      router = express.Router(),
      Controller = require('../Controllers/UserController');

router.get('/', (req, res, next) => Controller.indexAction(req, res).catch(next));
router.post('/register', (req, res, next) => Controller.registrationAction(req, res).catch(next));
router.post('/login', (req, res, next)=>Controller.loginAction(req, res).catch(next));
router.post('/logout', (req, res, next)=>Controller.logoutAction(req, res).catch(next));
module.exports = router;
