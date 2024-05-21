// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];
//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decodedToken.userId;
//     req.auth = {
//       userId: userId
//     };
//     next();
//   } catch (error) {
//     res.status(401).json({ error });
//   }
// };

// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1]; // Récupérer le token du header Authorization
//     const decodedToken = jwt.verify(token, process.env.JWT_SECRET); // Vérifier le token avec la clé secrète
//     req.auth = { userId: decodedToken.userId }; // Ajouter les données d'authentification à la requête
//     next(); // Passer au middleware suivant
//   } catch (error) {
//     res.status(401).json({ error: 'Invalid request!' }); // Gérer les erreurs de token
//   }
// };

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      console.error('Authorization header missing');
      throw new Error('Authorization header missing');
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      console.error('Token missing');
      throw new Error('Token missing');
    }

    console.log('Authorization Header:', authorizationHeader);
    console.log('Token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decodedToken);
    req.auth = { userId: decodedToken.userId };
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Unauthorized request!' });
  }
};



