require('dotenv')
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL)
.then(() => console.log('Database Successfully Connected'))
.catch((err) => console.log('Database is not Connected'))