const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ShortUrl = require('./models/shrinkURLs');

dotenv.config();
//creating instance of an express application
const app = express();

//connecting to the database
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {}).catch((error) => {
  console.log(`Could not connect to the database ${error.message}`);
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB Database connection established successfully');
});

//getting port from env file
const PORT = process.env.PORT || 3000;

//setting up the view engine
app.set('view engine', 'ejs');

//telling express that we are using url parameters
app.use(express.urlencoded({ extended: false }));

//simple GET route
app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find();
  res.render('index', { shortUrls: shortUrls });
});

//shrinkURLs POST route
app.post('/shrinkURLs', async (req, res) => {
  await ShortUrl.create({ full: req.body.fullURL });
  res.redirect('/');
});

//to get clicks
app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
  if (shortUrl === null) return res.sendStatus(404);

  shortUrl.clicks++;
  shortUrl.save();

  res.redirect(shortUrl.full);
});

app.listen(PORT, () => {
  console.log(`Server is running at port: ${PORT}`);
});
