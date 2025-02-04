import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  clerkRef?: string;
  linkedinURL: string;
  linkedinAudience: string;
  narative: string;
  postExamples: string[];
  subscription: number;
  niche: string;
}

const UserInfo: React.FC = () => {
  // Get the user object from Clerk (includes the unique Clerk ID)
  const { user } = useUser();

  // Initialize navigate
  const navigate = useNavigate();

  // Local state for form fields
  const [linkedinURL, setLinkedinURL] = useState<string>('');
  const [audience, setAudience] = useState<string>('');
  const [genre, setGenre] = useState<string>('');
  const [postExample1, setPostExample1] = useState<string>('');
  const [postExample2, setPostExample2] = useState<string>('');
  const [postExample3, setPostExample3] = useState<string>('');
  const [niche, setNiche] = useState<string>('');

  // Additional states for better UX
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent page refresh
    setLoading(true);   // Show loading state
    setError(null);     // Reset previous errors

    try {
      const clerkRef = user?.id;
      const data: UserData = {
        clerkRef,
        linkedinURL,
        linkedinAudience: audience,
        narative: genre,
        postExamples: [postExample1, postExample2, postExample3],
        subscription: 0,
        niche,
      };

      // Use an environment variable for your API URL in production
      const apiUrl: string = 'http://localhost:3000';

      const response = await axios.post(`${apiUrl}/api/userdata`, data);
      console.log('User created:', response.data);

      // Reset fields
      setLinkedinURL('');
      setAudience('');
      setGenre('');
      setPostExample1('');
      setPostExample2('');
      setPostExample3('');
      setNiche('');

      // Navigate to home after successful submission
      navigate('/');
    } catch (err: any) {
      console.error('Error creating user:', err);
      // You can enhance error handling based on error response structure
      setError(err.response?.data?.message || 'Failed to create user!');
      alert('Failed to create user!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">User Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LinkedIn URL */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn URL
              </label>
              <input
                type="url"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://www.linkedin.com/in/username/"
                value={linkedinURL}
                onChange={(e) => setLinkedinURL(e.target.value)}
                required
              />
            </div>
            
            {/* Audience */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Audience
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Marketing Professionals"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                required
              />
            </div>

            {/* Genre */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Genre
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Technology Trends"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                required
              />
            </div>
            
            {/* Niche */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Niche
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. AI in Healthcare"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                required
              />
            </div>

            {/* Post Examples */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Post Examples
              </label>
              {[
                { value: postExample1, setter: (v: string) => setPostExample1(v) },
                { value: postExample2, setter: (v: string) => setPostExample2(v) },
                { value: postExample3, setter: (v: string) => setPostExample3(v) }
              ].map(({value, setter}, index) => (
                <textarea
                  key={index}
                  placeholder={`Post Example ${index + 1}`}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-center text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;