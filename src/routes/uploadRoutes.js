const express = require('express');
const multer = require('multer');
const uploadControllerAWB = require('../controllers/uploadControllerAWB');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadControllerAWB.uploadFile);

module.exports = router;
