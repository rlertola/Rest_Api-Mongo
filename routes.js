'use strict';

const express = require('express');
const router = express.Router();

// bcrypt
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

// Allows use of "Course" to create documents and query the db.
const Course = require('./models').Course;

// USER ROUTES

// GET currently authenticated user.
router.get('/', (req, res, next) => {
  Course.find({}).exec((err, courses) => {
    if (err) return next(err);
    res.json(courses);
  });
});

// POST create user, sets Location header to '/' and returns no content.
router.post('/', (req, res, next) => {});

// COURSE ROUTES

// GET list of courses.
router.get('/', (req, res, next) => {});

// GET the course for the provided user id.
router.get('/:id', (req, res, next) => {});

// POST create a course, set Location header to the URI for the course, and return no content.
router.post('/', (req, res, next) => {});

// PUT update a course and return no content.
router.put('/', (req, res, next) => {});

// DELETE course and return no content.
router.delete('/', (req, res, next) => {});

module.exports = router;
