require('dotenv').config();

const express = require('express');

const methodOverride = require('method-override');


const connectDB = require('./server/config/db');

const app = express();
const PORT = process.env.PORT || 5000;
  
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(methodOverride('_method'));


app.use(express.static('public'));


app.set('view engine', 'ejs');
app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));


app.listen(PORT, ()=> {
  console.log(`App listening on port ${PORT}`);
});


