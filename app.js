const express = require('express');
const helmet = require('helmet');
const app = express();
const mongoose = require('mongoose');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const dotenv = require('dotenv');
dotenv.config();

const path = require('path');

// Vérification des variables d'environnement
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in .env file');
  process.exit(1);
}

// Gestion de la connexion à MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(err => {
    console.error('Connexion à MongoDB échouée !', err.message);
  });

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Configuration des CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Middleware pour parser le JSON
app.use(express.json());

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;