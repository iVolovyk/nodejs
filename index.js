const morgan = require('morgan');
const cors = require('cors');
const express = require('express');
const { check, validationResult } = require('express-validator');

const PORT = 8000;

const contacts = require('./contacts');

const server = express();

server.use(express.urlencoded());
server.use(express.json());

//Endpoints

server.get('/api/contacts', handleGetList);

server.get('/api/contacts/:contactId', handleGetContactById);

server.post('/api/contacts', handleAddContact);

server.delete('/api/contacts/:contactId', handleDeleteContactById);

server.patch('/api/contacts/:contactId', handleUpdateContact);

server.listen(PORT, () => {
  console.log('Server started on port', PORT);
});

//Handlers

async function handleGetList(req, res) {
  const data = await contacts.listContacts();

  res.set('Content-Type', 'application/json');
  res.status(200).send(data);
}

async function handleGetContactById(req, res, next) {
  const data = await contacts.getContactById(req.params.contactId);

  res.set('Content-Type', 'application/json');

  if (!data) return res.status(404).send({ message: 'Not found' });

  res.status(200).send(data);
}

async function handleAddContact(req, res, next) {
  res.set('Content-Type', 'application/json');

  await check('email').isEmail().run(req);
  await check('name').isLength({ min: 3 }).run(req);
  await check('phone').isLength({ min: 10 }).run(req);

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const { name, email, phone } = req.body;

  const data = await contacts.addContact(name, email, phone);

  res.status(201).send(data);
}

async function handleDeleteContactById(req, res, next) {
  const data = await contacts.removeContact(req.params.contactId);

  res.set('Content-Type', 'application/json');

  if (!data) return res.status(404).send({ message: 'Not found' });

  res.status(200).send({ message: 'contact deleted' });
}

async function handleUpdateContact(req, res, next) {
  res.set('Content-Type', 'application/json');

  console.log('Data input', req.body, req.params.contactId);

  const { name, email, phone } = req.body;

  if (!name && !email && !phone) {
    return res.status(400).send({ message: 'missing fields' });
  }

  if (email) await check('email').isEmail().run(req);
  if (name) await check('name').isLength({ min: 3 }).run(req);
  if (phone) await check('phone').isLength({ min: 10 }).run(req);

  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).send({ errors: result.array() });
  }

  const updateFilelds = {};

  if (name) updateFilelds.name = name;
  if (email) updateFilelds.email = email;
  if (phone) updateFilelds.phone = phone;

  const data = await contacts.updateContact(
    req.params.contactId,
    updateFilelds,
  );

  if (!data) return res.status(404).send({ message: 'Not found' });

  res.status(201).send(data);
}
