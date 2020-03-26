const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  try {
    const token = signToken(user._id);

    //Remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (err) {
    res.status(statusCode).json({
      status: 'success',
      message: err
    });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.login = async (req, res) => {
  try {
    // 1) Check if email and password exist
    const { email, password } = req.body;
    if (!email || !password)
      throw new Error('Please provide email and password');

    // 2) Check is user exists && password is correct
    const user = await User.findOne({ email });
    if (!(await user.correctPassword(password, user.password)))
      throw new Error('Incorrect email or password');

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new Error('You are not logged in! Please log in to get access.');
    }

    // 2) Validate token
    const decoded = await promisify(jwt.verify)(
      token,
      'my-ultra-secure-and-ultralongsecret'
    );

    // 3) Check if users still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new Error('The user with this Id no longer exists');
    }

    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // 1) Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error('No user exists with this email');
    }

    // 2) Generate the random 4-digit token
    const resetToken = user.createPasswordResetToken();
    console.log(resetToken);
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
      await sendEmail(resetToken);
      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
      });
    } catch (err) {
      user.PasswordResetToken = undefined;
      user.PasswordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new Error("Email can't be sent. Please try again!");
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    // 1) get user based on the token
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() }
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      throw new Error('Token is invalid or has expired');
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
    next();
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
