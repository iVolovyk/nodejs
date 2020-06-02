const { Router } = require('express');
const contactController = require('./contact.controller');
const userController = require('../users/user.controller');

const contactRouter = Router();

contactRouter.post(
  '/',
  userController.authorize,
  contactController.validateCreateContact,
  contactController.createContact,
);
contactRouter.get('/', userController.authorize, contactController.getContacts);
contactRouter.get(
  '/:contactId',
  userController.authorize,
  contactController.validateId,
  contactController.getContactById,
);
contactRouter.delete(
  '/:contactId',
  userController.authorize,
  contactController.validateId,
  contactController.deleteContactById,
);
contactRouter.patch(
  '/:contactId',
  userController.authorize,
  contactController.validateId,
  contactController.validateUpdateContact,
  contactController.updateContact,
);

module.exports = contactRouter;
