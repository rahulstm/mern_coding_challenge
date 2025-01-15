// transactionController.js
const axios = require('axios');
const Transaction = require('../models/Transaction');

// Fetch and insert transaction data into the database
const fetchData = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

    // Insert data into MongoDB
    await Transaction.insertMany(data);

    res.status(200).send('Database initialized successfully');
  } catch (error) {
    res.status(500).send('Error initializing database');
  }
};

// Get transactions with optional search and pagination
const getTransactions = async (req, res) => {
  const { search, page = 1, perPage = 10 } = req.query;
  const query = search ? {
    $or: [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { price: { $regex: search, $options: 'i' } }
    ]
  } : {};

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).send('Error fetching transactions');
  }
};

// Get statistics for a given month
const getStatistics = async (req, res) => {
  const { month } = req.query;

  try {
    const transactions = await Transaction.find({
      dateOfSale: { $regex: month, $options: 'i' }
    });

    const totalSales = transactions.reduce((sum, txn) => sum + txn.price, 0);
    const soldItems = transactions.filter(txn => txn.isSold).length;
    const unsoldItems = transactions.length - soldItems;

    res.status(200).json({ totalSales, soldItems, unsoldItems });
  } catch (error) {
    res.status(500).send('Error fetching statistics');
  }
};

// New function to get bar chart data grouped by price ranges
const getBarChartData = async (req, res) => {
  const { month } = req.query;
  const priceRanges = [
    { range: '0-100', min: 0, max: 100 },
    { range: '101-200', min: 101, max: 200 },
    { range: '201-300', min: 201, max: 300 },
    { range: '301-400', min: 301, max: 400 },
    { range: '401-500', min: 401, max: 500 },
    { range: '501-600', min: 501, max: 600 },
    { range: '601-700', min: 601, max: 700 },
    { range: '701-800', min: 701, max: 800 },
    { range: '801-900', min: 801, max: 900 },
    { range: '901-above', min: 901, max: Infinity }
  ];

  try {
    const data = await Promise.all(priceRanges.map(async ({ range, min, max }) => {
      const count = await Transaction.countDocuments({
        dateOfSale: { $regex: month, $options: 'i' },
        price: { $gte: min, $lt: max }
      });
      return { range, count };
    }));

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send('Error fetching bar chart data');
  }
};

// New function to get pie chart data grouped by category
const getPieChartData = async (req, res) => {
  const { month } = req.query;

  try {
    const data = await Transaction.aggregate([
      { $match: { dateOfSale: { $regex: month, $options: 'i' } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send('Error fetching pie chart data');
  }
};

// New function to get combined data
const getCombinedData = async (req, res) => {
  const { month } = req.query;

  try {
    const [statistics, barChartData, pieChartData] = await Promise.all([
      (async () => {
        const transactions = await Transaction.find({
          dateOfSale: { $regex: month, $options: 'i' }
        });

        const totalSales = transactions.reduce((sum, txn) => sum + txn.price, 0);
        const soldItems = transactions.filter(txn => txn.isSold).length;
        const unsoldItems = transactions.length - soldItems;

        return { totalSales, soldItems, unsoldItems };
      })(),
      (async () => {
        const priceRanges = [
          { range: '0-100', min: 0, max: 100 },
          { range: '101-200', min: 101, max: 200 },
          { range: '201-300', min: 201, max: 300 },
          { range: '301-400', min: 301, max: 400 },
          { range: '401-500', min: 401, max: 500 },
          { range: '501-600', min: 501, max: 600 },
          { range: '601-700', min: 601, max: 700 },
          { range: '701-800', min: 701, max: 800 },
          { range: '801-900', min: 801, max: 900 },
          { range: '901-above', min: 901, max: Infinity }
        ];

        return Promise.all(priceRanges.map(async ({ range, min, max }) => {
          const count = await Transaction.countDocuments({
            dateOfSale: { $regex: month, $options: 'i' },
            price: { $gte: min, $lt: max }
          });
          return { range, count };
        }));
      })(),
      (async () => {
        return Transaction.aggregate([
          { $match: { dateOfSale: { $regex: month, $options: 'i' } } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
      })()
    ]);

    res.status(200).json({ statistics, barChartData, pieChartData });
  } catch (error) {
    res.status(500).send('Error fetching combined data');
  }
};

module.exports = { fetchData, getTransactions, getStatistics, getBarChartData, getPieChartData, getCombinedData };
