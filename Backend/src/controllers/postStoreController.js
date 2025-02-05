const { PostBunch } = require('../models/postModel');
const TitlesModel = require('../models/titleModel');

async function getPostBunch(req, res) {
  try {
    const posts = await PostBunch.find({ clerkRef: req.body.clerkRef });
    const filteredPost = posts.find(p => p.status === false);

    if (!filteredPost) {
      return res.status(200).json({ success: false, message: "No post found" });
    }
    return res.status(200).json({ success: true, post: filteredPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.log(error);
  }
}

async function createPostBunch(req, res) {
  try {
    const titles = await TitlesModel.findOne({ clerkRef: req.body.clerkRef });

    if (!titles) {
      return res.status(404).json({ success: false, message: "No titles found" });
    }

    const selectedTitles = [];
    titles.categories.forEach(category => {
      category.titles.forEach(title => {
        if (title.selected) {
          selectedTitles.push({
            title: title.title,
            category: category.name
          });
        }
      });
    });

    if (selectedTitles.length === 0) {
      return res.status(400).json({ success: false, message: "No titles selected" });
    }

    const posts = selectedTitles.map(title => ({
      title: title.title,
      category: title.category,
      content: '',
      scheduled: false,
      posted: false
    }));

    const newPostBunch = new PostBunch({
      posts: posts,
      status: false,
      clerkRef: req.body.clerkRef
    });

    await newPostBunch.save();
    res.status(201).json({ success: true, postBunch: newPostBunch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    console.log(error);
  }
}

async function updatePostBunchTitles(req, res) {
  try {
    // Use findOne instead of find to get a single document
    const filteredPost = await PostBunch.findOne({ 
      clerkRef: req.body.clerkRef,
      status: false
    });

    if (!filteredPost) {
      return res.status(404).json({ success: false, message: "No post found" });
    }

    const titles = await TitlesModel.findOne({ clerkRef: req.body.clerkRef });

    if (!titles) {
      return res.status(404).json({ success: false, message: "No titles found" });
    }

    // Get currently selected titles
    const selectedTitles = [];
    titles.categories.forEach(category => {
      category.titles.forEach(title => {
        if (title.selected) {
          selectedTitles.push({
            title: title.title,
            category: category.name
          });
        }
      });
    });

    if (selectedTitles.length === 0) {
      return res.status(400).json({ success: false, message: "No titles selected" });
    }

    // Get titles that should be kept
    const postsToKeep = filteredPost.posts.filter(post =>
      post.content || post.scheduled || post.posted
    );

    // Create new posts array with kept posts
    const updatedPosts = [...postsToKeep];

    // Add new posts for selected titles
    selectedTitles.forEach(selectedTitle => {
      const titleExists = updatedPosts.some(post => post.title === selectedTitle.title);
      if (!titleExists) {
        updatedPosts.push({
          title: selectedTitle.title,
          category: selectedTitle.category,
          content: '',
          scheduled: false,
          posted: false
        });
      }
    });

    // Filter posts
    const finalPosts = updatedPosts.filter(post =>
      selectedTitles.some(title => title.title === post.title) ||
      post.content ||
      post.scheduled ||
      post.posted
    );

    // Use findOneAndUpdate with optimistic concurrency control
    const updatedPostBunch = await PostBunch.findOneAndUpdate(
      { 
        _id: filteredPost._id,
        __v: filteredPost.__v // Add version check
      },
      { 
        $set: { posts: finalPosts },
        $inc: { __v: 1 } // Increment version
      },
      { 
        new: true, // Return updated document
        runValidators: true
      }
    );

    if (!updatedPostBunch) {
      // If update fails due to version mismatch, retry the operation
      return res.status(409).json({ 
        success: false, 
        message: "Document was modified, please retry"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Posts updated successfully",
      postBunch: updatedPostBunch
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      errorCode: error.name === 'VersionError' ? 'VERSION_CONFLICT' : 'UNKNOWN_ERROR'
    });
  }
}

module.exports = {
  getPostBunch,
  createPostBunch,
  updatePostBunchTitles
};