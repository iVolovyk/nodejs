const { Router } = require('express');
const userController = require('./user.controller');

const authRouter = Router();
const userRouter = Router();

authRouter.post(
  '/register',
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

module.exports = { authRouter, userRouter };
