const mongoose = require('mongoose');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');

const config = require('./config');

const Users = require('./users');
const Course = require('./course');


function pullCourse(userId, courseId) {
  return new Promise((resolve, reject) => {
    Users.findById(userId, (err, user) => {
      if (err) {
        reject({ status: 422, message: err.message });
        return false;
      }
      const doc = user.course_taken.id(courseId);
      console.log(doc.credits);
      user.credits_total -= doc.credits;
      user.course_taken.pull(courseId);
      user.save((error) => {
        if (error) {
          reject({ status: 422, message: err.status });
        }
        resolve();
      });
    });
  });
}

function getCourseCredits(courseId) {
  return new Promise((resolve, reject) => {
    Course.findById(courseId, { credits: 1 }, (err, course) => {
      if (err) {
        reject({ status: 422, message: error.message });
        return false;
      }
      if (!course) {
        reject({ status: 404, message: 'No course found' });
        return false;
      }
      resolve({ credits: course.credits });
    });
  });
}

function updateUser(_id, data) {
  return new Promise((resolve, reject) => {
    Users.update({ _id }, data, (err, resp) => {
      if (err) {
        reject({ status: 422, message: err.message });
        return false;
      }
      console.log('----------Update User resp---------');
      if (resp.nMatched === 0) {
        reject({ status: 404, message: 'No updation' });
        return false;
      }
      resolve();
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
};

exports.handler = (event, context, callback) => {
  let payload = null;
  return new Promise((resolve, reject) => {
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
      .then((data) => {
        payload = data;
        if (!event.body.courseId) {
          return Promise.reject({ status: 400, message: 'Invalid Request' });
        }
        return pullCourse(payload._id, event.body.courseId);
      })
      .then(() => {
        callback(null, { status: 200, message: 'Course Removed' });
      })
      .catch((error) => {
        callback(error.message, { status: error.status, message: error.message });
      });
  });
};
