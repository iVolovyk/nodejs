const fs = require("fs");
const { promises: fsPromises } = fs;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const contactsPath = path.join(__dirname, "db", "contacts.json");
const utf8 = "utf8";

//Promise Api

async function listContacts() {
  try {
    const data = await fsPromises.readFile(contactsPath, utf8);

    console.table(JSON.parse(data));
  } catch (err) {
    console.log(err);
  }
}

async function getContactById(contactId) {
  try {
    const data = await fsPromises.readFile(contactsPath, utf8);

    const contact = JSON.parse(data).find(
      (contact) => contact.id === contactId,
    );

    console.table(contact);
  } catch (err) {
    console.log(err);
  }
}

async function removeContact(contactId) {
  try {
    const data = await fsPromises.readFile(contactsPath, utf8);

    const filteredData = JSON.parse(data).filter(
      (contact) => contact.id !== contactId,
    );

    const strignifiedData = JSON.stringify(filteredData);

    await fsPromises.writeFile(contactsPath, strignifiedData, utf8);

    console.log(`The contact with id: ${contactId} removed successfully!`);
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

    console.log("The contact added successfully!");
  } catch (err) {
    console.log(err);
  }
}

//Callback Api

// function listContacts() {
//   fs.readFile(contactsPath, utf8, (err, data) => {
//     if (err) throw err;

//     console.table(JSON.parse(data));
//   });
// }

// function getContactById(contactId) {
//   fs.readFile(contactsPath, utf8, (err, data) => {
//     if (err) throw err;

//     const contact = JSON.parse(data).find(
//       (contact) => contact.id === contactId,
//     );

//     console.table(contact);
//   });
// }

// function removeContact(contactId) {
//   fs.readFile(contactsPath, utf8, (err, data) => {
//     if (err) throw err;

//     const filteredData = JSON.parse(data).filter(
//       (contact) => contact.id !== contactId,
//     );

//     const strignifiedData = JSON.stringify(filteredData);

//     fs.writeFile(contactsPath, strignifiedData, utf8, (err) => {
//       if (err) throw err;

//       console.log(`The contact with id: ${contactId} removed successfully!`);
//     });
//   });
// }

// function addContact(name, email, phone) {
//   fs.readFile(contactsPath, utf8, (err, data) => {
//     if (err) throw err;

//     const newContact = {
//       id: uuidv4(),
//       name,
//       email,
//       phone,
//     };

//     const parsedData = JSON.parse(data);

//     parsedData.push(newContact);

//     const strignifiedData = JSON.stringify(parsedData);

//     fs.writeFile(contactsPath, strignifiedData, utf8, (err) => {
//       if (err) throw err;

//       console.log("The contact added successfully!");
//     });
//   });
// }

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
