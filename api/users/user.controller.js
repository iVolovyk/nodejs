const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('./user.model');
require('dotenv').config(); // process.env vaiables import
const JWT_SECRET = process.env.JWT_SECRET;
const {
  Types: { ObjectId },
} = require('mongoose');
const {
  CoflictError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
} = require('../helpers/errors.constructors');

class UserController {
  constructor() {
    this._costFactor = 4;
    this.createUser = this._createUser.bind(this);
  }

  async _createUser(req, res, next) {
    try {
      const { email, password } = req.body;
      const passwordHash = await bcryptjs.hash(password, this._costFactor);

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          message: 'Email in use',
        });
      }

      const user = await userModel.create({
        email,
        password: passwordHash,
      });

      return res.status(201).json({
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedError('Email or password is wrong');
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Email or password is wrong');
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, {
        expiresIn: 3 * 24 * 60 * 60, //three days
      });

      const updatedUser = await userModel.updateUser(user._id, { token });

      return res.status(200).json({
        token: updatedUser.token,
        user: {
          email: updatedUser.email,
          subscription: updatedUser.subscription,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async authorize(req, res, next) {
    try {
      // 1. витягнути токен користувача з заголовка Authorization
      const authorizationHeader = req.get('Authorization') || '';
      const token = authorizationHeader.replace('Bearer ', '');

      // 2. витягнути id користувача з пейлоада або вернути користувачу помилку зі статус кодом 401
      let userId;
      try {
        userId = await jwt.verify(token, JWT_SECRET).id;
      } catch (err) {
        next(new UnauthorizedError('Not authorized'));
      }

      // 3. витягнути відповідного користувача. Якщо такого немає - викинути помилку зі статус кодом 401
      // userModel - модель користувача в нашій системі
      const user = await userModel.findById(userId);

      if (!user || user.token !== token) {
        throw new UnauthorizedError('Not authorized');
      }

      // 4. Якщо все пройшло успішно - передати запис користувача і токен в req і передати обробку запиту на наступний middleware
      req.user = user;

      next();
    } catch (err) {
      next(err);
    }
  }

  async logoutUser(req, res, next) {
    try {
      const loggedOutUser = await userModel.updateUser(req.user._id, {
        token: null,
      });
      if (!loggedOutUser) {
        throw new UnauthorizedError('Not authorized');
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  refreshUser(req, res, next) {
    const { email, subscription } = req.user;
    return res.status(200).json({
      email,
      subscription,
    });
  }

  async updateUserSub(req, res, next) {
    try {
      const { _id: userId } = req.user;

      const userToUpdate = await userModel.updateUser(userId, req.body);

      const { subscription, email } = userToUpdate;

      if (!userToUpdate) {
        return res.status(404).send();
      }

      return res.status(201).json({ subscription, email });
    } catch (err) {
      next(err);
    }
  }

  validateId(req, res, next) {
    const { userId } = req.params;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).send();
    }

    next();
  }

  validateUserCredentials(req, res, next) {
    const validationSchema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const validationResult = validationSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(400).json(validationResult.error);
    }

    next();
  }

  validateUpdateUser(req, res, next) {
    const validationSchema = Joi.object({
      subscription: Joi.string().required().valid('free', 'pro', 'premium'),
    });

    const validationResult = validationSchema.validate(req.body);

    if (validationResult.error) {
      return res.status(400).json(validationResult.error);
    }

    next();
  }
}

module.exports = new UserController();
