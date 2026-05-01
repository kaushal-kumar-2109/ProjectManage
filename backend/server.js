const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DATABSE_URL || process.env.DATABSE_SRV_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use('/api', require('./routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));