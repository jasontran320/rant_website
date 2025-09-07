require('dotenv').config();
const cors = require('cors');

const session = require('express-session') 

const express = require('express');

const connectDB = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 5000;

//connect to db
connectDB();

//app.use(express.static('public'));

app.use(cors());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 30 } // 30 minutes
}));

app.use('/api', require('./server/routes/main'));


app.listen(PORT, ()=> {
    console.log(`App listeining on port ${PORT}`);
})