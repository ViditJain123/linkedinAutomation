import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';
import { motion } from 'framer-motion'; // You'll need to install framer-motion
import { 
  FiMonitor, 
  FiBriefcase, 
  FiBarChart2, // Changed from FiTrending
  FiDollarSign, 
  FiHeart, 
  FiBook,
  FiStar 
} from 'react-icons/fi';  // Add this import for icons
import { useUser } from '@clerk/clerk-react';

interface TitleItem {
  id: string | number; // Changed from number to string | number
  text: string;
  isCustom?: boolean;  // New property to identify custom titles
  niche: string;  // New property
  selected?: boolean; // new property to hold selection from DB
}

interface Niche {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CategoryData {
  name: string;
  titles: { title: string; selected: boolean; _id?: string }[]; // change from string[] to object[]
  _id?: string;
}

const GenerateTitle: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [allTitles, setAllTitles] = useState<TitleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiCategories, setApiCategories] = useState<CategoryData[]>([]);

  const fetchTitles = React.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/titles?clerkRef=${user.id}`, 
        { method: 'GET' }
      );
      if (!response.ok) throw new Error(`Fetch failed. Status: ${response.status}`);
      const data = await response.json();
      setApiCategories(data.categories); // Save API categories
      console.log(user.id)
      // Flatten categories using the optional _id from the response
      const fetchedTitles = data.categories.flatMap((cat: CategoryData) =>
        cat.titles.map((titleObj, idx) => ({
          // Use the title's MongoDB _id if available, else fall back to the existing logic
          id: titleObj._id ?? (cat._id ? `${cat._id}-${idx}` : idx),
          text: titleObj.title,
          niche: cat.name,
          selected: titleObj.selected || false,
        }))
      );
      setAllTitles(fetchedTitles);
      // Pre-populate selectedTitles based on the fetched selected flag
      setSelectedTitles(fetchedTitles.filter((t: TitleItem) => t.selected).map((t: TitleItem) => t.id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    fetchTitles();
  }, [fetchTitles]);

  const niches: Niche[] = [
    { id: 'tech', name: 'Technology', icon: <FiMonitor className="w-5 h-5" /> },
    { id: 'business', name: 'Business', icon: <FiBriefcase className="w-5 h-5" /> },
    { id: 'marketing', name: 'Marketing', icon: <FiBarChart2 className="w-5 h-5" /> },
    { id: 'finance', name: 'Finance', icon: <FiDollarSign className="w-5 h-5" /> },
    { id: 'health', name: 'Health', icon: <FiHeart className="w-5 h-5" /> },
    { id: 'education', name: 'Education', icon: <FiBook className="w-5 h-5" /> },
    { id: 'custom', name: 'Custom Titles', icon: <FiStar className="w-5 h-5" /> },
  ];

  const [selectedTitles, setSelectedTitles] = useState<(string | number)[]>([]);
  // Keep track of which page (0 or 1) the user is on
  const [page, setPage] = useState(0);

  // Maximum number of titles that can be selected
  const MAX_SELECTION = 45;

  const [customTitles, setCustomTitles] = useState<TitleItem[]>([]);
  
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);

  // Use useMemo to prevent unnecessary recalculation
  const filteredTitles = useMemo(() => {
    if (!selectedNiche) return [...customTitles, ...allTitles];
    if (selectedNiche === 'custom') return customTitles;
    return [...customTitles, ...allTitles].filter(title => title.niche === selectedNiche);
  }, [selectedNiche, customTitles, allTitles]);

  // Items per page constant
  const ITEMS_PER_PAGE = 30;

  // Calculate pagination values dynamically
  const shouldShowPagination = filteredTitles.length > ITEMS_PER_PAGE;
  const pageCount = Math.ceil(filteredTitles.length / ITEMS_PER_PAGE);
  
  // Update pagination calculation
  const startIndex = page * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const titlesToShow = shouldShowPagination 
    ? filteredTitles.slice(startIndex, endIndex)
    : filteredTitles;

  // Navigation handlers for dynamic pages
  const handleNextPage = () => {
    if (page < pageCount - 1) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(0);
    }
  };

  // Reset page when filtered items change or niche changes
  React.useEffect(() => {
    const maxPage = Math.ceil(filteredTitles.length / ITEMS_PER_PAGE) - 1;
    if (page > maxPage) {
      setPage(0);
    }
  }, [filteredTitles.length, selectedNiche]);

  // Toggle a single title selection
  const handleTitleToggle = (id: string | number) => {
    setSelectedTitles((prevSelected) => {
      // If already selected, unselect
      if (prevSelected.includes(id)) {
        return prevSelected.filter((titleId) => titleId !== id);
      }
      // If not selected but under the limit, select it
      if (prevSelected.length < MAX_SELECTION) {
        return [...prevSelected, id];
      }
      // If at limit, do nothing or show an error
      alert(`You can select up to ${MAX_SELECTION} titles only.`);
      return prevSelected;
    });
  };

  // Randomly select about 30 from the entire 60
  const handleRandomSelect = () => {
    const shuffled = [...allTitles].sort(() => 0.5 - Math.random());
    const randomTitles = shuffled.slice(0, 30).map((item) => item.id);
    setSelectedTitles(randomTitles);
  };

  // Navigate back to homepage
  const handleBack = () => {
    navigate('/');
  };

  // Handle "Start Generating"
  const handleStartGenerating = async () => {
    if (!user?.id) {
      alert("User not authenticated.");
      return;
    }
    // Send both clerkRef and customTitles to the API
    try {
      const response = await fetch('http://localhost:3000/api/titles/generateTitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clerkRef: user.id,
          // send IDs of selected titles
          selectedIds: selectedTitles,
          customTitles: customTitles.map(title => title.text),
        }),
      });
      if (!response.ok) throw new Error(`Fetch failed. Status: ${response.status}`);
      await fetchTitles(); // <-- Refresh selections
      // You may process response if required
      navigate('/review-post');
    } catch (error) {
      console.error(error);
      alert('Error saving titles. Please try again.');
    }
  };

  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitleInput, setCustomTitleInput] = useState('');

  const handleCustomTitleSubmit = async () => {
    if (!user?.id) {
      alert("User not authenticated.");
      return;
    }
    
    const newCustomTitles = customTitleInput
      .split('\n')
      .filter(title => title.trim());

    try {
      const response = await fetch('http://localhost:3000/api/titles/generateTitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clerkRef: user.id,
          customTitles: newCustomTitles,
          updateCustomOnly: true  // Add this flag to indicate custom title update
        }),
      });

      if (!response.ok) throw new Error(`Fetch failed. Status: ${response.status}`);
      
      const updatedData = await response.json();
      setApiCategories(updatedData.categories);

      // Update local state with new custom titles
      const newCustomTitleObjects = newCustomTitles.map((title, index) => ({
        id: `custom-${Date.now()}-${index}`,
        text: title,
        isCustom: true,
        niche: 'custom'
      }));

      setCustomTitles(prev => [...newCustomTitleObjects, ...prev]);
      setSelectedNiche('custom');
      setShowCustomModal(false);
      setCustomTitleInput('');

    } catch (error) {
      console.error(error);
      alert('Error updating custom titles. Please try again.');
    }
  };

  // Display a loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading titles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <AiOutlineArrowLeft className="h-6 w-6 text-gray-600" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Select Your Titles</h1>
                <p className="text-sm text-gray-500 mt-1">Choose up to {MAX_SELECTION} titles</p>
              </div>
            </div>
            
            {/* Selection Counter - Simplified */}
            <div className="bg-blue-50 px-4 py-2 rounded-full">
              <div className="flex items-center">
                <div className="text-sm text-blue-700 font-medium">
                  {selectedTitles.length}/{MAX_SELECTION} Selected
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Niches Panel */}
          <div className="w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
              
              {/* All Topics Button */}
              <button
                onClick={() => setSelectedNiche(null)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition-all
                  ${!selectedNiche 
                    ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <span>All Topics</span>
              </button>

              <div className="space-y-1">
                {apiCategories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedNiche(cat.name)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all
                      ${selectedNiche === cat.name 
                        ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                        : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <span>{cat.name}</span>
                  </button>
                ))}
                {customTitles.length > 0 && (
                  <button
                    onClick={() => setSelectedNiche('custom')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all
                      ${selectedNiche === 'custom'
                        ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                        : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    <span>Custom Titles</span>
                    <span className="ml-auto text-xs text-gray-500">
                      ({customTitles.length})
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
              <div className="flex space-x-4">
                {/* Existing Random Selection button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRandomSelect}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  Random Selection
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCustomModal(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Custom Titles
                </motion.button>
              </div>
              {/* Conditional Pagination */}
              {shouldShowPagination && (
                <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-lg">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePrevPage}
                    disabled={page === 0}
                    className={`p-2 rounded-full ${page === 0 ? 'text-gray-400' : 'text-gray-600 hover:bg-white hover:shadow-md'}`}
                  >
                    <AiOutlineArrowLeft className="h-5 w-5" />
                  </motion.button>
                  <span className="font-medium text-gray-700">
                    Page {page + 1} of {pageCount}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleNextPage}
                    disabled={page === pageCount - 1}
                    className={`p-2 rounded-full ${page === pageCount - 1 ? 'text-gray-400' : 'text-gray-600 hover:bg-white hover:shadow-md'}`}
                  >
                    <AiOutlineArrowRight className="h-5 w-5" />
                  </motion.button>
                </div>
              )}
            </div>

            {/* Titles Grid */}
            <div className="grid grid-cols-3 gap-4 mb-24">
              {titlesToShow.map((title) => {
                const isSelected = selectedTitles.includes(title.id);
                const niche = niches.find(n => n.id === title.niche);
                
                return (
                  <motion.div
                    key={title.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'bg-blue-50 border-blue-500 shadow-md' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'}
                      ${title.isCustom ? 'border-l-4 border-l-purple-500' : ''}`}
                    onClick={() => handleTitleToggle(title.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors
                      ${isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-300 group-hover:border-blue-300'}`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-700 group-hover:text-gray-900">
                        {title.text}
                      </span>
                      {(title.isCustom || niche) && (
                        <div className="mt-1 text-xs text-gray-500">
                          {title.isCustom ? 'Custom' : niche?.name}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Titles Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Add Custom Titles</h3>
            <p className="text-sm text-gray-600 mb-4">Enter one title per line</p>
            <textarea
              value={customTitleInput}
              onChange={(e) => setCustomTitleInput(e.target.value)}
              className="w-full h-48 p-3 border rounded-lg mb-4"
              placeholder="Enter your titles here..."
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomTitleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Titles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedTitles.length} titles selected
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartGenerating}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
          >
            Start Generating
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default GenerateTitle;