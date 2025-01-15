const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.json());

// Import and use routes
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api', transactionRoutes); // Mounting on '/api'

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
