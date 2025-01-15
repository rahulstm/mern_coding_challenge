const express = require('express');
const router = express.Router();
const { fetchData } = require('../controllers/transactionController');

// Route to initialize the database
router.get('/init', fetchData);

module.exports = router;
