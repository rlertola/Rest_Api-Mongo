'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Please enter a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please enter a last name']
  },
  emailAddress: {
    type: String,
    validate: {
      validator: v => {
        return emailRegex.test(v);
      },
      message: props => `${props.value} is not a valid email address`
    },
    required: [true, 'Please enter an email address']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password']
  }
});

// This middleware stops duplicate emails from being saved.
UserSchema.post('save', (err, doc, next) => {
  if (err.name === 'MongoError' && err.code === 11000) {
    next(new Error('Sorry, that email already exists'));
  } else {
    next();
  }
});

const CourseSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Please enter a title']
  },
  description: {
    type: String,
    required: [true, 'Please enter a description']
  },
  estimatedTime: String,
  materialsNeeded: String
});

const Course = mongoose.model('Course', CourseSchema);
const User = mongoose.model('User', UserSchema);

module.exports = {
  Course,
  User
};
