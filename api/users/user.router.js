const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const userController = require('./user.controller');

const authRouter = Router();
const userRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp');
  },
  filename: (req, file, cb) => {
    if (!file.mimetype.includes('image')) {
      const err = new Error();
      err.status = 400;
      return cb(err);
    }

    const originName = file.originalname;
    const pathParse = path.parse(originName);
    const fileWithFormat = `${Date.now()}${pathParse.ext}`;
    cb(null, fileWithFormat);
  },
});

const upload = multer({ storage });

authRouter.post(
  '/register',
  userController.checkExistingUser,
  userController.createAvatar,
  userController.createAvatarURL,
  userController.validateUserCredentials,
  userController.createUser,
);
authRouter.patch(
  '/login',
  userController.validateUserCredentials,
  userController.loginUser,
);
authRouter.patch(
  '/logout',
  userController.authorize,
  userController.logoutUser,
);

userRouter.get(
  '/current',
  userController.authorize,
  userController.refreshUser,
);
userRouter.patch(
  '/',
  userController.authorize,
  userController.validateUpdateUser,
  userController.updateUserSub,
);
userRouter.patch(
  '/avatars',
  userController.authorize,
  upload.single('avatar'),
  userController.compressImage,
  userController.createUpdatedAvatarURL,
  userController.updateUserAvatar,
);

module.exports = { authRouter, userRouter };
