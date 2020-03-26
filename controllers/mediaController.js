const Media = require('./../models/mediaModel');
const User = require('./../models/userModel');

exports.upload = async (req, res) => {
  try {
    const newVideo = await Media.create(req.body);
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        videosUploaded: newVideo._id
      }
    });
    res.status(201).json({
      status: 'success',
      data: {
        video: newVideo
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getVideos = async (req, res) => {
  try {
    const videos = await Media.find();

    res.status(200).json({
      status: 'success',
      results: videos.length,
      data: {
        videos
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getMyVideos = async (req, res) => {
  try {
    const video = await User.findById(req.user.id)
      .populate('videosUploaded')
      .select('videosUploaded');

    res.status(200).json({
      status: 'success',
      results: video.length,
      data: {
        video
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};
