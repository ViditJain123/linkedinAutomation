import { useUser } from '@clerk/clerk-react';
import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GeneratePost: React.FC = () => {
  const navigate = useNavigate();
  const sampleImages = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200'
  ];

  const [selectedImage, setSelectedImage] = useState<string>(sampleImages[0]); // Set default image
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [text, setText] = useState('');
  const maxChars = 1300; // LinkedIn's character limit
  const [acceptedPosts, setAcceptedPosts] = useState<Set<number>>(new Set());

  // Handle selecting one of the predefined images
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleNextPost = () => {
    // Placeholder logic to move to next post
    setCurrentPostIndex((prevIndex) => (prevIndex + 1) % 30);
  };

  const handlePrevPost = () => {
    setCurrentPostIndex((prevIndex) => (prevIndex - 1 + 30) % 30);
  };

  // Handle uploading a custom image
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const toggleAcceptPost = () => {
    setAcceptedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentPostIndex)) {
        newSet.delete(currentPostIndex);
      } else {
        newSet.add(currentPostIndex);
      }
      return newSet;
    });
  };

  const isCurrentPostAccepted = acceptedPosts.has(currentPostIndex);

  const samplePost = `As a tech leader with over 15 years of experience, I've learned that successful digital transformation isn't just about implementing new technologies—it's about fostering a culture of innovation and continuous learning.

Today, I want to share three key insights that have consistently driven successful outcomes in our digital initiatives:

1. People First, Technology Second
The most sophisticated technology solutions fail without user buy-in. Focus on building a change-ready culture before introducing new tools.

2. Start Small, Think Big
Begin with pilot projects that demonstrate quick wins while maintaining a clear vision of your long-term digital strategy. This approach builds confidence and momentum.

3. Data-Driven Decision Making
Let data guide your transformation journey. Establish clear metrics early and adjust your strategy based on real-world feedback.

Remember: Digital transformation is a journey, not a destination. The key is to remain adaptable and keep your team engaged throughout the process.

#DigitalTransformation #Leadership #Innovation #TechnologyStrategy`;

  // NEW: Editable post content state initialized with sample post.
  const [postContent, setPostContent] = useState(samplePost);

  const { user } = useUser();

  // NEW: On component mount, fetch the post bunch from the API using POST with a clerkRef
  useEffect(() => {
    if (!user) return; // added null-check for user
    const clerkRef = user.id;
    fetch('http://localhost:3000/api/postbunch/postbunch', {  // <<-- update URL as required
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkRef: clerkRef })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text();
      })
      .then(text => {
        // Sometimes the response may be empty or not valid JSON.
        if (text) {
          const data = JSON.parse(text);
          if (data?.posts?.length > 0) {
            setPostContent(data.posts[0].title);
          }
        } else {
          console.error('Empty response text received');
        }
      })
      .catch(error => console.error('Error fetching post bunch:', error));
  }, []);

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/generate-posts')}
              className="hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold ml-4">Review LinkedIn Post</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Accepted Posts Counter */}
            <div className="bg-gray-50 px-4 py-1 rounded-full flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {acceptedPosts.size}/30 Accepted
              </span>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
              <button
                onClick={handlePrevPost}
                className="p-2 hover:bg-white rounded-full transition-all duration-200 transform hover:scale-105"
                title="Previous Post"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="mx-4 text-sm font-medium text-gray-700">Post {currentPostIndex + 1}/30</span>
              <button
                onClick={handleNextPost}
                className="p-2 hover:bg-white rounded-full transition-all duration-200 transform hover:scale-105"
                title="Next Post"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Done Button */}
            <button
              onClick={() => navigate('/')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Done
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="h-[calc(100vh-4rem)] grid grid-cols-[1fr_300px] gap-6 max-w-7xl mx-auto px-4 py-6">
        {/* Left column - Post content */}
        <div className="flex flex-col h-full">
          {/* AI-Generated Post Card */}
          {/* AI-Generated Post Card */}
          <div className="bg-white shadow-lg rounded-xl p-8 transition-shadow hover:shadow-xl flex-grow mb-6 flex flex-col">
            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold">Post Preview</h2>
                <div
                  className={`ml-3 px-3 py-1 text-sm rounded-full ${isCurrentPostAccepted ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                    }`}
                >
                  {isCurrentPostAccepted ? 'Accepted' : 'Ready for Review'}
                </div>
              </div>

              {/* Accept/Unaccept Button */}
              <button
                onClick={toggleAcceptPost}
                className={`px-4 py-2 rounded-lg flex items-center transition-all duration-200 ${isCurrentPostAccepted
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isCurrentPostAccepted ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  )}
                </svg>
                {isCurrentPostAccepted ? 'Reject' : 'Accept'}
              </button>
            </div>

            {/* Text area wrapper so it can grow to fill remaining space */}
            <div className="flex-grow relative overflow-y-auto">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full h-full text-gray-700 whitespace-pre-wrap leading-relaxed bg-transparent border-none focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Suggestion input area - Enhanced */}
          <div className="bg-white shadow-lg rounded-xl p-4 h-[120px] sticky bottom-0">
            <div className="mb-2 flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                <label className="font-medium text-gray-700">Suggest Improvements</label>
              </div>
              <span className="text-sm text-gray-500">
                {text.length}/{maxChars}
              </span>
            </div>
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-[60px] resize-none border-0 bg-white rounded-lg pr-12 py-3 px-4 focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400"
                placeholder="Suggest changes to improve this LinkedIn post..."
                maxLength={maxChars}
                style={{
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.1)"
                }}
              />
              <button
                className="absolute bottom-2 right-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Submit Suggestion"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right column - Image selection */}
        <div className="space-y-4 overflow-y-auto">
          {/* Selected image preview - Enhanced */}
          <div className="bg-white shadow-lg rounded-xl p-4 relative group">
            <h2 className="text-md font-semibold mb-3 flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Selected Image
            </h2>
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full rounded-lg transform transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>

          {/* Predefined images */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="text-md font-semibold mb-3">Select an Image</h2>
            <div className="grid grid-cols-2 gap-2">
              {sampleImages.map((url, index) => (
                <div
                  key={index}
                  className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 ${selectedImage === url ? 'ring-2 ring-blue-500' : ''
                    }`}
                  onClick={() => handleImageSelect(url)}
                >
                  <img
                    src={url}
                    alt={`Template ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Upload section */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="text-md font-semibold mb-3">Upload Custom Image</h2>
            <label
              htmlFor="customImageUpload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex flex-col items-center justify-center">
                <svg className="w-6 h-6 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-500">Upload image</p>
              </div>
              <input
                id="customImageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeneratePost;