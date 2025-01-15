// transactionRoutes.js
const express = require('express');
const { 
  getTransactions, 
  fetchData, 
  getStatistics, 
  getBarChartData, 
  getPieChartData, 
  getCombinedData 
} = require('../controllers/transactionController');

const router = express.Router();

// Route for listing transactions
router.get('/transactions', getTransactions);

// Route for initializing the database
router.get('/transactions/init', fetchData);

// Route for fetching statistics
router.get('/transactions/statistics', getStatistics);

// Route for fetching bar chart data
router.get('/transactions/barchart', getBarChartData);

// Route for fetching pie chart data
router.get('/transactions/piechart', getPieChartData);

// Route for fetching combined data
router.get('/transactions/combined', getCombinedData);

module.exports = router;
