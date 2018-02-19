const mongoose = require('mongoose');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-js');

const config = {
  dbUri: 'mongodb://hardik_chawla13:nSqTGi2ofrXIODLy@serverlessffcs-shard-00-00-0uik2.mongodb.net:27017,serverlessffcs-shard-00-01-0uik2.mongodb.net:27017,serverlessffcs-shard-00-02-0uik2.mongodb.net:27017/admin?replicaSet=ServerlessFFCS-shard-0&ssl=true',
}

const userSchema = new mongoose.Schema({
  registration_number: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile_image: {
    type: String,
    required: true,
  },
  school_code: {
    type: String,
    required: true,
  },
  current_year: {
    type: Number,
  },
  course_distribution: {
    type: Schema.Types.ObjectId,
    ref: '',
  }
});

exports.handler = function (event, context, callback) {
  const User = mongoose.model('Users', userSchema);
  mongoose.connect(config.dbUri, {
    useMongoClient: true,
    promiseLibrary: require('bluebird'),
  }, () => {
    if (!event.registration_number || !event.password) {
      callback(404, { status: 404, message: 'Invalid Request' });
    }
    User.find({ registration_number: event.registration_number })
    .then((user) => {
      if (user.length === 0) {
        return Promise.reject({ status: 404, message: 'User does not exist' });
      }
      if (!bcrypt.compareSync(event.password, user.password)) {
        return Promise.reject({ status: 409, message: 'Password dont match' });
      }
      const data = {
        name: user.name,
        profile_image: user.profile_image,
        registration_number: user.registration_number,
        school_code: user.school_code,
      };
      callback(null, { user_data: data, token: jwt.sign(data, config.secret) });
    })
    .catch((err) => {
      callback(error.status, { status: error.status, message: err.message });
    })
  });
}