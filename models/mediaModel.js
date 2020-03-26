const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Please enter a URL'],
    unique: true
  }
});

const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
