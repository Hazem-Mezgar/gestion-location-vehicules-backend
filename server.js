const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const app = express();


const carRoutes = require('./routes/carRoutes');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const contratRoutes = require('./routes/contratRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const paymentRoutes = require('./routes/paymentRoutes');


const fs = require('fs');

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}


// Connexion à la base de données MongoDB
connectDB();
// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());
app.use(cors());


// Route de base pour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.send('Bienvenue sur l\'API de gestion de location de voitures');
});

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Utilisation des routes pour les voitures
app.use('/api/cars', carRoutes);
// Utilisation des routes pour l'authentification
app.use('/api/auth', authRoutes);

// Utilisation des routes pour les réservations
app.use('/api/reservations', reservationRoutes);
//utilisation des routes pour les contrats
app.use('/api/contracts', contratRoutes);

// Utilisation des routes pour les paiements
app.use('/api/payments', paymentRoutes);

// Utilisation des routes pour les catégories
app.use('/api/category', categoryRoutes);


// Définition du port d'écoute
const PORT = process.env.PORT || 5000;
// Démarrage du serveur
app.listen(PORT,() => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});