const mongoose = require('mongoose');
const Card = require('../models/card');
const { NotFound, BadRequest, Forbidden } = require('../errors');

const getCard = (req, res, next) => {
  Card.find({})
    .orFail(() => {
      throw new NotFound('Карточка не найдена');
    })
    .populate('user')
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch((err) => {
      next(err);
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .orFail(() => {
      throw new BadRequest('BadRequest');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({ message: err.message });
      }
      return next(err);
    });
};

const deleteCard = (req, res, next) => {
  const owner = req.user._id;
  if (!owner) {
    throw new Forbidden('Нельзя удалить чужую карточку');
  }
  if (owner) {
    Card.findByIdAndRemove(req.params.cardId)
      .orFail(() => {
        throw new NotFound('Карточка не найдена');
      })
      .then((card) => res.send({ data: card }))
      .catch((err) => {
        if (err instanceof mongoose.CastError) {
          return res.status(400).send({ message: 'id not found' });
        }
        return next(err);
      });
  }
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFound('Карточка не найдена');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof mongoose.CastError) {
        return res.status(400).send({ message: 'id not found' });
      }
      return next(err);
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new NotFound('Карточка не найдена');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err instanceof mongoose.CastError) {
        return res.status(400).send({ message: 'id not found' });
      }
      return next(err);
    });
};

module.exports = {
  getCard, createCard, deleteCard, likeCard, dislikeCard,
};
