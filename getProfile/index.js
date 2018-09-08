const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const config = require('./config');

const User = require('./users');

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, config.secret, (err, payload) => {
      if (err) {
        reject({ status: 409, message: err.message });
        return false;
      }
      resolve(payload);
    });
  });
}

function getUserService(userId) {
  return new Promise((resolve, reject) => {
    User.findById(userId, { password: 0 }, (err, result) => {
      if (err) {
        reject({ status: 422, message: err.message });
        return false;
      }
      resolve(result);
    });
  });
}

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  mongoose.connect(config.dbUri, {
    useMongoClient: true,
    promiseLibrary: require('bluebird'),
  })
    .then(() => {
      console.log('----------Mongodb Connected---------');
      if (!event.headers.Authorization) {
        return Promise.reject({ status: 400, message: 'Not allowed' });
      }
      return verifyToken(event.headers.Authorization);
    })
    .then((payload) => {
      return getUserService(payload._id);
    })
    .then((result) => {
      callback(null, { status: 200, user: result });
    })
    .catch((err) => {
      callback(err.status, { status: err.status, message: err.message });
    });
};
