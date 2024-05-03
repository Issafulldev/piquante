const express = require('express');
const app = express();

const mongoose = require('mongoose');

const userRoutes = require('./routes/user');

const dotenv = require("dotenv");
dotenv.config();

// Gestion de la connexion à MongoDB
mongoose.connect(process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Middleware pour parser le JSON
app.use(express.json());

// Configuration des CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/auth', userRoutes);

module.exports = app;