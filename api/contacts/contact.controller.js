const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const contactModel = require('./contact.model');
const {
  Types: { ObjectId },
} = require('mongoose');

class ContactController {
  constructor() {}

  async createContact(req, res, next) {
    try {
      const { phone, name, email } = req.body;

      const existingContact = await contactModel.findContactByEmail(email);
      if (existingContact) {
        return res.status(409).send('Contact with such email already exists');
      }

      const contact = await contactModel.create({
        name,
        email,
        phone,
      });

      return res.status(201).json({
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      });
    } catch (err) {
      next(err);
    }
  }

  async getContacts(req, res, next) {
    try {
      const contacts = await contactModel.find();

      return res.status(200).json(contacts);
    } catch (err) {
      next(err);
    }
  }

  async getContactById(req, res, next) {
    try {
      const { contactId } = req.params;

      const contact = await contactModel.findById(contactId);
      if (!contact) {
        return res.status(404).send();
      }

      return res.status(200).json(contact);
    } catch (err) {
      next(err);
    }
  }

  async deleteContactById(req, res, next) {
    try {
      const contactId = req.params.contactId;

      const deletedContact = await contactModel.findByIdAndDelete(contactId);
      if (!deletedContact) {
        return res.status(404).send();
      }

      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async updateContact(req, res, next) {
    try {
      const { contactId } = req.params;

      const contactToUpdate = await contactModel.findContactByIdAndUpdate(
        contactId,
        req.body,
      );

      console.log('contactToUpdate', contactToUpdate);

      if (!contactToUpdate) {
        return res.status(404).send();
      }

      return res.status(201).json(contactToUpdate);
    } catch (err) {
      next(err);
    }
  }

  validateId(req, res, next) {
    const { contactId } = req.params;

    if (!ObjectId.isValid(contactId)) {
      return res.status(400).send();
    }

    next();
  }

  validateCreateContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      subscription: Joi.string(),
      password: Joi.string(),
    });

    const validationResult = Joi.validate(req.body, validationRules);
    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }

  validateUpdateContact(req, res, next) {
    const validationRules = Joi.object({
      name: Joi.string(),
      email: Joi.string(),
      phone: Joi.string(),
      subscription: Joi.string(),
      password: Joi.string(),
    });

    const validationResult = Joi.validate(req.body, validationRules);
    if (validationResult.error) {
      return res.status(400).send(validationResult.error);
    }

    next();
  }
}

module.exports = new ContactController();
