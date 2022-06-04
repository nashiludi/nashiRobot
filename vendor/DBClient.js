require('dotenv').config();
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.DB_URL);
module.exports = client;