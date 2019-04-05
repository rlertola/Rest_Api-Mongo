# TREEHOUSE TECHDEGREE PROJECT 9 - REST API Mongo

This project was built using Express, Mongo DB and Mongoose.

The API will provide a way for users to administer a school database containing information about courses: users can interact with the database by retrieving a list of courses, as well as adding, updating and deleting courses in the database.

In addition, the project will require users to create an account and log-in to make changes to the database.

#### Getting Started

To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install

```

Second, ensure that you have MongoDB installed globally on your system.

Third, seed your MongoDB database with data.

```
npm run seed
```

And lastly, start the application.

```
npm start
```

#### Schema and Models and Validation

Required fields will display an error if empty.

**User**

- First (required)
- Last Name (required)
- Email\* (required and checked using regex)
- Password (required)

_\*Middleware located under the UserSchema will check to make sure duplicate email is not added and will throw an error if so._

**Course**

- User
- Title (required)
- Description (required)
- Estimated Time
- Materials Needed

#### Routes

**User**

- GET /api/users 200 - gets all users.
- POST /api/users 201 - create new user.

**Course**

- GET /api/courses 200 - gets list of courses.
- GET /api/courses/:id 200 - gets single course.
- POST /api/courses 201 - creates new course.
- PUT /api/courses/:id 204 - edit and update course.
- DELETE /api/courses/:id 204 - delete single course.

#### Permissions and Password Hashing

A current user must be logged in with correct credentials to access records. Passwords are hashed using bcrypt. An authenticateUser middleware function is used in:

- GET /api/users
- POST /api/courses
- PUT /api/courses/:id
- DELETE /api/courses/:id
