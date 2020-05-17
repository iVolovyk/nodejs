const { Router } = require('express');
const contactController = require('./contact.controller');

const contactRouter = Router();

contactRouter.post(
  '/',
  contactController.validateCreateContact,
  contactController.createContact,
);
contactRouter.get('/', contactController.getContacts);
contactRouter.get(
  '/:contactId',
  contactController.validateId,
  contactController.getContactById,
);
contactRouter.delete(
  '/:contactId',
  contactController.validateId,
  contactController.deleteContactById,
);
contactRouter.patch(
  '/:contactId',
  contactController.validateId,
  contactController.validateUpdateContact,
  contactController.updateContact,
);

module.exports = contactRouter;
