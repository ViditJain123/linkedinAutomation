const postQueue = require('./postQueue');
const { generatePostWithAgent } = require('../services/postGenerationAgent');
const { io } = require('../socket/socket');
const User = require('../models/userDataModel');
const { PostBunch } = require('../models/postModel');

postQueue.process(async (job) => {
  const { title, userId, postBunchId } = job.data;

  try {
    // Fetch user data
    const userData = await User.findOne({ clerkRef: userId });
    if (!userData) {
      throw new Error('User not found');
    }

    // Generate post content using the agent with correct parameters
    const result = await generatePostWithAgent(title, {
      linkedinAudience: userData.linkedinAudience,
      narative: userData.narative,
      postExamples: userData.postExamples
    });

    // Update the post status in the bunch
    await PostBunch.updateOne(
      { 
        _id: postBunchId,
        'posts.title': title 
      },
      { 
        $set: { 'posts.$.content': result.output }
      }
    );

    // Emit to the user via socket
    io.to(userId.toString()).emit('postGenerated', {
      title,
      content: result.output,
    });

    return { success: true };
  } catch (error) {
    console.error('Post generation error:', error);
    throw error;
  }
});