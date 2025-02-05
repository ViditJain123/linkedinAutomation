const { PostBunch } = require('../models/postModel');
const postQueue = require('../queues/postQueue');

exports.generatePosts = async (req, res, next) => {
  try {
    const clerkRef = req.body.clerkRef; // Fixed extraction

    if (!clerkRef) {
      return res.status(400).json({ message: 'clerkRef is required in request body.' });
    }

    const postBunch = await PostBunch.findOne({ 
      status: false,
      clerkRef: clerkRef
    });

    if (!postBunch || !postBunch.posts || !postBunch.posts.length) {
      return res.status(404).json({ message: 'No pending posts found.' });
    }

    const userId = clerkRef; // Use clerkRef directly instead of req.body.clerkRef

    for (const post of postBunch.posts) {
      await postQueue.add({ title: post.title, userId, postBunchId: postBunch._id });
    }

    return res.status(200).json({ message: 'Post generation started.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};