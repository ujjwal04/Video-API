const express = require('express');

const mediaController = require('./../controllers/mediaController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.post('/upload', userController.protect, mediaController.upload);
router.get('/getMyVideos', userController.protect, mediaController.getMyVideos);

router.route('/').get(mediaController.getVideos);

module.exports = router;
