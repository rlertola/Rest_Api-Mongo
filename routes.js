'use strict';

const express = require('express');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();

// bcrypt
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Allows use of Course and User to create documents and query the db.
const Course = require('./models').Course;
const User = require('./models').User;

// Authenticate user.
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

// **Temporary, delete when done**
router.get('/usersAll', (req, res) => {
  User.find({}).exec((err, users) => {
    res.json(users);
  });
});

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
  user.save((err, user) => {
    if (err) return next(err);
    res.location('/');
    res.status(201);
    res.json(user);
  });
});

// COURSE ROUTES

// GET list of courses.
router.get('/courses', (req, res, next) => {
  Course.find({}).exec((err, courses) => {
    if (err) return next(err);
    res.json(courses);
  });
});

// GET the course for the provided user id.
router.get('/courses/:courseID', (req, res, next) => {
  res.json(req.course);
});

// POST create a course, set Location header to the URI for the course, and return no content.
router.post('/courses', (req, res, next) => {
  const course = new Course(req.body);
  course.save((err, course) => {
    if (err) return next(err);
    res.location(`/courses/${course.id}`);
    res.status(201);
    res.json(course);
  });
});

// PUT update a course and return no content.
router.put('/courses/:courseID', (req, res, next) => {
  req.course.update(req.body, (err, result) => {
    if (err) return next(err);
    res.json(result);
  });
});

// DELETE course and return no content.
router.delete('/courses/:courseID', (req, res, next) => {
  req.course.remove(err => {
    if (err) return next(err);
    res.location('/courses');
    res.status(204);
    res.json(Course);
  });
});

module.exports = router;
