const TitlesModel = require('../models/titleModel');
const { PostBunch } = require('../models/postModel');

async function getOrCreatePostBunch(req, res) {
  try {
    const { clerkRef } = req.body;
    if (!clerkRef) {
      return res.status(400).json({ error: 'clerkRef is required' });
    }
    // Check if a post bunch with status false and matching clerkRef exists
    let postBunch = await PostBunch.findOne({ status: false, clerkRef });
    if (postBunch) {
      return res.json(postBunch);
    }
    // If not, get titles and categories info from TitleModel
    const titlesData = await TitlesModel.findOne();
    if (!titlesData) {
      return res.status(404).json({ error: 'No title data found' });
    }
    const posts = [];
    titlesData.categories.forEach(category => {
      category.titles
        .filter(t => t.selected)
        .forEach(title => {
          posts.push({ title: title.title, category: category.name });
        });
    });
    postBunch = new PostBunch({ posts, status: false, clerkRef });
    await postBunch.save();
    return res.json(postBunch);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = { getOrCreatePostBunch };
// ...existing code if any...
