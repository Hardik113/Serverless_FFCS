const mongoose = require('mongoose');
const Promise = require('bluebird');
const jwt = require('jsonwebtoken');

const config = require('./config');

const Users = require('./users');
const Course = require('./course');
const FacultyCourse = require('./faculty_course');


function getCourse(data) {
  return new Promise((resolve, reject) => {
    Course.findById(data.course, (err, result) => {
      if (err) {
        reject({ status: 422, message: err.message });
        return false;
      }
      if (!result) {
        reject({ status: 404, message: 'No course found' });
        return false;
      }
      resolve(result);
    });
  });
}

function getFacultyCourse(data) {
  return new Promise((resolve, reject) => {
    FacultyCourse.findById(data.slot, (err, result) => {
      if (err) {
        reject({ status: 422, message: err.message });
        return false;
      }
      if (!result) {
        reject({ status: 404, message: 'No course found' });
        return false;
      }
      resolve(result);
    });
  });
}

function updateFacultyCourse(courseIdList) {
  return new Promise((resolve, reject) => {
    console.log(courseIdList);
    const promises = [];
    courseIdList.forEach((courseId) => {
      promises.push(FacultyCourse.update({ _id: courseId }, { $inc: { seats: -1 } }));
    });
    Promise.all(promises)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject({ status: 422, message: error.message });
      });
  });
}

function pushCourse(userId, courses) {
  return new Promise((resolve, reject) => {
    Users.findById(userId, (err, user) => {
      if (err) {
        reject({ status: 422, message: err.message });
        return false;
      }
      courses.forEach((course) => {
        user.course_taken.push(course);
      });
      user.save((err) => {
        console.log(err);
        if (err) {
          reject({ status: 422, message: err.status });
        }
        resolve();
      });
    });
  });
}

function updateUser(_id, data) {
  return new Promise((resolve, reject) => {
    Users.update({ _id }, data, (err, resp) => {
      if (err) {
        console.log(err);
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
}

exports.handler = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const theoryData = {};
  const labData = {};
  let payload = null;
  const courses = [];
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
      return getCourse({ course: event.body.course });
    })
    .then((course) => {
      console.log('----------Got Course---------');
      theoryData.name = course.title;
      theoryData.code = course.course_code;
      labData.name = course.title;
      labData.code = course.course_code;
      if (event.body.theory_slot) {
        return getFacultyCourse({ slot: event.body.theory_slot });
      }
      return Promise.resolve();
    })
    .then((result) => {
      console.log('----------Got Theory Slot---------');
      if (!event.body.theory_slot) {
        return Promise.resolve();
      }
      theoryData.venue = result.venue;
      theoryData.start_time = result.start_time;
      theoryData.end_time = result.end_time;
      theoryData.slot = result.slot;
      theoryData.credits = result.credits;
      courses.push(theoryData);
      if (event.body.lab_slot) {
        return getFacultyCourse({ slot: event.body.lab_slot });
      }
      return Promise.resolve();
    })
    .then((result) => {
      console.log('----------Got lAB Slot---------');
      if (!event.body.lab_slot) {
        return Promise.resolve();
      }
      labData.venue = result.venue;
      labData.start_time = result.start_time;
      labData.end_time = result.end_time;
      labData.slot = result.slot;
      labData.credits = result.credits;
      courses.push(labData);
      return Promise.resolve();
    })
    .then(() => {
      console.log('----------Updating data---------');
      return pushCourse(payload._id, courses);
    })
    .then(() => {
      if (event.body.theory_slot && event.body.lab_slot) {
        return updateUser(payload._id, { $inc: { credits_total: parseInt(labData.credits, 10) + parseInt(theoryData.credits, 10) } });
      } else if (event.body.theory_slot) {
        return updateUser(payload._id, { $inc: { credits_total: parseInt(theoryData.credits, 10) } });
      }
      return updateUser(payload._id, { $inc: { credits_total: parseInt(labData.credits, 10) } });
    })
    .then(() => {
      if (event.body.theory_slot && event.body.lab_slot) {
        return updateFacultyCourse([event.body.theory_slot, event.body.lab_slot]);
      } else if (event.body.theory_slot) {
        return updateFacultyCourse([event.body.theory_slot]);
      }
      return updateFacultyCourse([event.body.lab_slot]);
    })
    .then(() => {
      console.log('----------Updated the user---------');
      callback(null, { status: 200, message: 'Course Added Successfully' });
    })
    .catch((error) => {
      console.log(error);
      callback(error.status, { status: error.status, message: error.message });
    });
};
