const express = require('express');
const mongoose = require('mongoose');
const contactRouter = require('./contacts/contact.router');
const { userRouter, authRouter } = require('./users/user.router');

//Enable .env variables
require('dotenv').config();

// 1. create server
// 2. init global middlewares
// 3. init routes
// 4. init db
// 5. start listening
// mongoose.set('debug', true);
mongoose.set('useCreateIndex', true);

module.exports = class ContactServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    await this.initDatabase();
    return this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.urlencoded({ extended: true }));
    this.server.use(express.json());
  }

  initRoutes() {
    this.server.use('/api/contacts', contactRouter);
    this.server.use('/auth', authRouter);
    this.server.use('/users', userRouter);
  }

  async initDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Database connection successful');
    } catch (err) {
      console.log('err', err);
      process.exit(1);
    }
  }

  startListening() {
    const PORT = process.env.PORT;

    return this.server.listen(PORT, () => {
      console.log('Server listening on port', PORT);
    });
  }
};
