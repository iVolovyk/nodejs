const Joi = require('@hapi/joi');
Joi.objectId = require('joi-objectid')(Joi);
const jdenticon = require('jdenticon');
const Jimp = require('jimp');
const { promises: fsPromises } = require('fs');
const path = require('path');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('./user.model');
require('dotenv').config(); // process.env vaiables import
const { JWT_SECRET, PORT } = process.env;
const {
  Types: { ObjectId },
} = require('mongoose');
const { UnauthorizedError } = require('../helpers/errors.constructors');

class UserController {
  constructor() {
    this._costFactor = 4;
    this.createUser = this._createUser.bind(this);
  }

  async checkExistingUser(req, res, next) {
    try {
      const { email } = req.body;
      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          message: 'Email in use',
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async createAvatar(req, res, next) {
    const size = 200;
    const value = new Date();
    const png = jdenticon.toPng(value, size);
    const fileName = `${Date.now()}.png`;
    const filePath = path.join(__dirname, '../../tmp', fileName);

    try {
      await fsPromises.writeFile(filePath, png);
      req.filePath = filePath;
      req.fileName = fileName;
      next();
    } catch (err) {
      next(err);
    }
  }

  async createAvatarURL(req, res, next) {
    const publicPath = path.join(
      __dirname,
      '../../public/images',
      req.fileName,
    );
    const avatarURL = `http://localhost:${PORT}/images/${req.fileName}`;
    try {
      await fsPromises.rename(req.filePath, publicPath);
      req.avatarURL = avatarURL;
      next();
    } catch (err) {
      next(err);
    }
  }

  async _createUser(req, res, next) {
    try {
      const { avatarURL } = req;
      const { email, password } = req.body;
      const passwordHash = await bcryptjs.hash(password, this._costFactor);

      const user = await userModel.create({
        email,
        password: passwordHash,
        avatarURL,
      });

      return res.status(201).json({
        user: {
          email: user.email,
          subscription: user.subscription,
          avatarURL: user.avatarURL,
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
    const { email, subscription, avatarURL } = req.user;
    return res.status(200).json({
      email,
      subscription,
      avatarURL,
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

  async compressImage(req, res, next) {
    try {
      const { path: filePath, filename } = req.file;
      const COMPRESSED_IMAGES_DIST = 'public/images';
      const compressedFilePath = path.join(COMPRESSED_IMAGES_DIST, filename);

      const lenna = await Jimp.read(filePath);
      lenna
        .resize(200, Jimp.AUTO) // resize 256 * auto
        .quality(80) // set JPEG quality
        .write(compressedFilePath); // save

      req.file = {
        ...req.file,
        destination: COMPRESSED_IMAGES_DIST,
        path: compressedFilePath,
      };

      await fsPromises.unlink(filePath);

      next();
    } catch (err) {
      next(err);
    }
  }

  createUpdatedAvatarURL(req, res, next) {
    console.log('req.file', req.file);
    console.log('req.body', req.body);

    const avatarURL = `http://localhost:${PORT}/images/${req.file.filename}`;
    req.avatarURL = avatarURL;
    // res.status(200).json({ avatarURL });
    next();
  }

  async updateUserAvatar(req, res, next) {
    try {
      const { _id: userId } = req.user;

      const userToUpdate = await userModel.updateUser(userId, {
        avatarURL: req.avatarURL,
      });
      console.log('userToUpdate', userToUpdate);

      const { avatarURL } = userToUpdate;

      if (!userToUpdate) {
        return res.status(404).send();
      }

      return res.status(201).json({ avatarURL });
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
