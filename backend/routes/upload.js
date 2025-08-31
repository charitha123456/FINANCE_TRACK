const express = require('express');
const { processReceipt, processPDF } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/receipt', upload.single('file'), processReceipt);
router.post('/pdf', upload.single('file'), processPDF);

module.exports = router;