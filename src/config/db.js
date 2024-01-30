// blog_app/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  const url = 'mongodb+srv://jetpack:test123@cluster0.s4btiqm.mongodb.net/?retryWrites=true&w=majority';

  try {
    mongoose.connect(url, {
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once('open', (_) => {
    console.log(`Database connected: ${url}`);
  });

  dbConnection.on('error', (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
};

module.exports = {
    connectDB
}