const mongoose = require('mongoose');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');

const config = require('./config');

const CourseFaculty = require('./faculty_course');
const Faculty = require('./faculty');
const Course = require('./course');

function getService(data) {
  console.log('-------Function Called----------');
  return new Promise((resolve, reject) => {
    CourseFaculty.find({ course: data.course })
      .populate('faculty course')
      .sort({ slot: 1 })
      .exec((err, results) => {
        if (err) {
          console.log(err);
          reject({ status: 422, message: err.message });
        }
        resolve(results);
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
      console.log('----------Mongodb Connected---------');
      if (!event.headers.Authorization) {
        return Promise.reject({ status: 400, message: 'Not allowed' });
      }
      return verifyToken(event.headers.Authorization);
    })
    .then(() => {
      console.log('----------Mongodb Connected---------');
      return getService({ course: event.course });
    })
    .then((result) => {
      console.log('----------Query Executed---------');
      callback(null, { resArray: result, count: result.length });
    })
    .catch((error) => {
      callback(error.status, { message: error.message, status: error.status });
    });
};
