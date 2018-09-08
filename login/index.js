const mongoose = require('mongoose');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

mongoose.Promise = require('bluebird');


const config = require('./config');

const User = require('./users');

function findService(data) {
  console.log('-------Function Called----------');
  return new Promise((resolve, reject) => {
    User.find({ registration_number: data.registration_number }, (err, result) => {
      if (err) {
        reject({ status: 422, message: err.message });
      }
      resolve(result);
    });
  });
}

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  mongoose.connect(config.dbUri, { useMongoClient: true, promiseLibrary: require('bluebird') })
    .then(() => {
      console.log('----------Mongodb Connected---------');
      if (!event.body.registration_number || !event.body.password) {
        callback(404, { status: 404, message: 'Invalid Request' });
      }
      return findService({ registration_number: event.body.registration_number });
    })
    .then((user) => {
      console.log('---------Query Executed--------');
      if (user.length === 0) {
        return Promise.reject({ status: 404, message: 'User does not exist' });
      }
      if (!bcrypt.compareSync(event.body.password, user[0].password)) {
        return Promise.reject({ status: 409, message: 'Password dont match' });
      }
      const data = {
        name: user[0].name,
        profile_image: user[0].profile_image,
        _id: user[0]._id,
        registration_number: user[0].registration_number,
        school_code: user[0].school_code,
      };
      callback(null, { user_data: data, token: jwt.sign(data, config.secret) });
    })
    .catch((err) => {
      console.log('-----------Error---------');
      callback(err.status, { status: err.status, message: err.message });
    });
};
