'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  emailAddress: String,
  password: String
});

const CourseSchema = new Schema({
  user: [UserSchema],
  title: String,
  description: String,
  estimatedTime: String,
  materialsNeeded: String
});

const Course = mongoose.model('Course', CourseSchema);

module.exports.Course = Course;
