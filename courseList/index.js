const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const config = require('./config');

const CourseList = require('./course');

function findService(data) {
  console.log('-------Function Called----------');
  return new Promise((resolve, reject) => {
    CourseList.find({ category: data.category }, (err, result) => {
      if (err) {
        reject({ status: 422, message: err.message });
      }
      resolve(result);
    });
  });
}

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

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  mongoose.connect(config.dbUri, {
    useMongoClient: true,
    promiseLibrary: require('bluebird'),
  })
    .then(() => {
      if (!event.headers.Authorization) {
        return Promise.reject({ status: 400, message: 'Not allowed' });
      }
      return verifyToken(event.headers.Authorization);
    })
    .then(() => {
      console.log('----------Mongodb Connected---------');
      return findService({ category: event.category });
    })
    .then((list) => {
      console.log('----------Query Executed---------');
      callback(null, { resArray: list, count: list.length });
    })
    .catch((error) => {
      callback(error.status, { status: error.status, message: error.message });
    });
};
