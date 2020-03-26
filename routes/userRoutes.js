const express = require('express');

const userController = require('./../controllers/userController');

const router = express.Router();

router.post('/signup', userController.signup);
router.post('/login', userController.login);

router.post(
  '/forgotPassword',
  userController.protect,
  userController.forgotPassword
);
router.patch(
  '/resetPassword/:token',
  userController.protect,
  userController.resetPassword
);

router.route('/').get(userController.getAllUsers);

module.exports = router;
