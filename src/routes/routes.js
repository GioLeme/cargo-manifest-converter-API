const express = require('express');
const multer = require('multer');
const uploadControllerAWB = require('../controllers/uploadControllerAWB');
const crossdockingController = require('../controllers/crossdockingController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadControllerAWB.uploadFile);
router.post('/generate-crossdocking-priorities', upload.single('file'), crossdockingController.generatePriorities);

module.exports = router;
