const express = require('express');

const userRouter = require('./routes/userRoutes');
const mediaRouter = require('./routes/mediaRoutes');

const app = express();

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Routes
app.use('/api/users', userRouter);
app.use('/api/media', mediaRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'No matching url on this API'
  });
});

module.exports = app;
