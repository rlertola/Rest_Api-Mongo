'use strict';

const express = require('express');
const router = express.Router();

// bcrypt
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Allows use of Course and User to create documents and query the db.
const Course = require('./models').Course;
const User = require('./models').User;

// Authenticate user. Middleware that verifies user and password.
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);

  if (credentials) {
    const user = await User.findOne({ emailAddress: credentials.name });

    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );

      if (authenticated) {
        console.log(
          `Authentication successful for username: ${user.emailAddress}`
        );
        req.currentUser = user;
      } else {
        res.sendStatus(401);
        message = `Authentication failure for username: ${user.emailAddress}`;
      }
    } else {
      message = `User not found for username: ${user.emailAddress}`;
    }
  } else {
    message = `Auth header not found`;
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message: `Access denied` });
  } else {
    next();
  }
};

// Preloads course doc for matching routes.
router.param('courseID', (req, res, next, id) => {
  Course.findById(id, (err, doc) => {
    if (err) return next(err);
    if (!doc) {
      err = new Error('Not Found');
      err.status = 404;
      return next(err);
    }
    req.course = doc;
    return next();
  });
});

// USER ROUTES

// GET currently authenticated user.
router.get('/users', authenticateUser, (req, res, next) => {
  const user = req.currentUser;
  res.json({
    name: `${user.firstName} ${user.lastName}`,
    username: user.emailAddress
  });
});

// POST create user, sets Location header to '/' and returns no content.
router.post('/users', (req, res, next) => {
  const user = new User(req.body);
  if (user.password) {
    user.password = bcryptjs.hashSync(user.password);
  }

  user.save((err, user) => {
    if (err) return next(err);
    res.location('/');
    res.status(201);
    res.json(user);
  });
});

// ------------------------------------------
// *** THESE GET AND DELETE ROUTES NOT REQUIRED BY PROJECT - FOR TESTING ONLY ***
// GET all users.
router.get('/usersAll', (req, res) => {
  User.find({}).exec((err, users) => {
    res.json(users);
  });
});

// DELETE individual users.
router.delete('/users/delete/:id', (req, res, next) => {
  const id = req.params.id;
  User.findOneAndDelete({ _id: id }, (err, user) => {
    if (err) return next(err);
  });
  res.json(User);
});
// ------------------------------------------

// COURSE ROUTES

// GET list of courses. Uses deep population to show only user names.
router.get('/courses', (req, res, next) => {
  Course.find({})
    .populate('user', ['firstName', 'lastName'])
    .exec((err, courses) => {
      if (err) return next(err);
      res.json(courses);
    });
});

// GET course for the provided id. Uses deep population to show only user name.
router.get('/courses/:courseID', (req, res, next) => {
  const id = req.params.courseID;
  Course.findById(id)
    .populate('user', ['firstName', 'lastName'])
    .exec((err, course) => {
      if (err) return next(err);
      res.json(course);
    });
});

// POST create a course, set Location header to the URI for the course, and return no content.
router.post('/courses', authenticateUser, (req, res, next) => {
  const course = new Course(req.body);
  course.save((err, course) => {
    if (err) return next(err);
    res.location(`/courses/${course.id}`);
    res.status(201);
    res.json(course);
  });
});

// PUT update a course and return no content. Checks if user is authorized to update course.
router.put('/courses/:courseID', authenticateUser, (req, res, next) => {
  if (req.course.user.equals(req.currentUser._id)) {
    req.course.update(req.body, (err, result) => {
      if (err) return next(err);
      res.json(result);
    });
  } else {
    res
      .status(403)
      .json({ message: 'You do not have authorization to update this record' });
  }
});

// DELETE course and return no content. Checks if user is authorized to delete course.
router.delete('/courses/:courseID', authenticateUser, (req, res, next) => {
  if (req.course.user.equals(req.currentUser._id)) {
    req.course.remove(err => {
      if (err) return next(err);
      res.location('/courses');
      res.status(204);
      res.json(Course);
    });
  } else {
    res
      .status(403)
      .json({ message: 'You do not have authorization to delete this record' });
  }
});

module.exports = router;
