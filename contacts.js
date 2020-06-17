
const fs = require('fs');
const { promises: fsPromises } = fs;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const contactsPath = path.join(__dirname, 'db', 'contacts.json');
const utf8 = 'utf8';


async function listContacts() {
  try {
    const data = await fsPromises.readFile(contactsPath, utf8);

    return data;

  } catch (err) {
    console.log(err);
  }
}

async function getContactById(contactId) {
  try {
    const data = await fsPromises.readFile(contactsPath, utf8);

    const contact = JSON.parse(data).find(contact => contact.id === contactId);

    return contact;

  } catch (err) {
    console.log(err);
  }
}

async function removeContact(contactId) {
  try {

    let userDeleted;

    const data = await fsPromises.readFile(contactsPath, utf8);

    const contact = JSON.parse(data).find(contact => contact.id === contactId);

    if (!contact) return (userDeleted = false);

    const filteredData = JSON.parse(data).filter(
      contact => contact.id !== contactId,

    );

    const strignifiedData = JSON.stringify(filteredData);

    await fsPromises.writeFile(contactsPath, strignifiedData, utf8);

    return (userDeleted = true);

  } catch (err) {
    console.log(err);
  }
}

async function addContact(name, email, phone) {
  try {
    const data = await fsPromises.readFile(contactsPath, utf8);

    const newContact = {
      id: uuidv4(),
      name,
      email,
      phone,
    };

    const parsedData = JSON.parse(data);

    parsedData.push(newContact);

    const strignifiedData = JSON.stringify(parsedData);

    await fsPromises.writeFile(contactsPath, strignifiedData, utf8);

    return newContact;

  } catch (err) {
    console.log(err);
  }
}


async function updateContact(contactId, updateFilelds) {
  try {
    let userUpdated;

    const data = await fsPromises.readFile(contactsPath, utf8);

    const contact = JSON.parse(data).find(contact => contact.id === contactId);

    if (!contact) {
      return (userUpdated = false);
    }

    userUpdated = { ...contact, ...updateFilelds };

    const updatedContacts = JSON.parse(data).reduce((acc, el) => {
      el.id === userUpdated.id ? acc.push(userUpdated) : acc.push(el);
      return acc;
    }, []);

    console.log('updatedContacts', updatedContacts);

    const strignifiedData = JSON.stringify(updatedContacts);

    await fsPromises.writeFile(contactsPath, strignifiedData, utf8);

    return userUpdated;
  } catch (err) {
    console.log(err);
  }
}


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
