const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Boba = require('./models/boba');

mongoose.connect('mongodb://localhost:27017/boba-lovers', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/bobas', async (req, res) => {
  const bobas = await Boba.find({});
  res.render('bobas/index', { bobas });
});

app.get('/bobas/new', (req, res) => {
  res.render('bobas/new');
});

app.post('/bobas', async (req, res) => {
  const boba = new Boba(req.body.boba);
  await boba.save();
  res.redirect(`/bobas/${boba._id}`);
});

app.get('/bobas/:id', async (req, res) => {
  const boba = await Boba.findById(req.params.id);
  res.render('bobas/show', { boba });
});

app.get('/bobas/:id/edit', async (req, res) => {
  const boba = await Boba.findById(req.params.id);
  res.render('bobas/edit', { boba });
});

app.put('/bobas/:id/', async (req, res) => {
  const { id } = req.params;
  const boba = await Boba.findByIdAndUpdate(id, { ...req.body.boba });
  res.redirect(`/bobas/${boba._id}`);
});

app.delete('/bobas/:id', async (req, res) => {
  const { id } = req.params;
  await Boba.findByIdAndDelete(id);
  res.redirect('/bobas');
})

app.listen(3000, () => {
  console.log('Serving on port 3000');
});
