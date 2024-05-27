const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      })
    }
  );
};

exports.createSauce = (req, res, next) => {
  try {
    console.log('Requête reçue :', req.body);
    console.log('Fichier reçu :', req.file);

    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;

    const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: [],
    });

    sauce.save()
      .then(() => { res.status(201).json({ message: 'Objet enregistré !' }); })
      .catch(error => { res.status(400).json({ error }); });
  } catch (error) {
    console.error('Erreur lors de la création de la sauce :', error);
    res.status(400).json({ error: 'Invalid JSON' });
  }
};


exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const oldImageUrl = sauce.imageUrl;
        const filename = oldImageUrl.split('/images/')[1];

        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => {
            if (req.file) {
              fs.unlink(`images/${filename}`, (err) => {
                if (err) console.log(err);
                else console.log(`Deleted old image: ${filename}`);
              });
            }
            res.status(200).json({ message: 'Objet modifié !' });
          })
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.likeSauce = (req, res, next) => {
  const like = req.body.like; // Récupère l'état du like (1, 0, -1)
  const userId = req.auth.userId; // Récupère l'ID de l'utilisateur
  const sauceId = req.params.id; // Récupère l'ID de la sauce

  Sauce.findOne({ _id: sauceId })
    .then(sauce => {
      if (!sauce) {
        return res.status(404).json({ error: 'Sauce not found' });
      }

      if (like === 1) {
        if (!sauce.usersLiked.includes(userId)) {
          sauce.usersLiked.push(userId);
          sauce.likes++;
        }
      } else if (like === -1) {
        if (!sauce.usersDisliked.includes(userId)) {
          sauce.usersDisliked.push(userId);
          sauce.dislikes++;
        }
      } else if (like === 0) {
        if (sauce.usersLiked.includes(userId)) {
          sauce.usersLiked.pull(userId);
          sauce.likes--;
        } if (sauce.usersDisliked.includes(userId)) {
          sauce.usersDisliked.pull(userId);
          sauce.dislikes--;
        }
      }

      sauce.save()
        .then(() => res.status(200).json({ message: 'Sauce updated!' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};