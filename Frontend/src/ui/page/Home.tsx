import { useState } from 'react';
import { format, isSameMonth, isBefore, startOfDay, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { generateCalendarMatrix, getNextMonth, getPreviousMonth } from '../utils/calender';
import { UserButton } from "@clerk/clerk-react";

// Types
interface CardData {
  id: string;
  title: string;
}

interface CalendarAssignments {
  [key: string]: string[];
}

function Home() {
  const navigate = useNavigate();
  const [cards] = useState<CardData[]>([
    { id: 'c1', title: 'Design Homepage' },
    { id: 'c2', title: 'Develop Login Form' },
    { id: 'c3', title: 'Fix Bug #123' },
    { id: 'c4', title: 'Prepare Presentation' },
  ]);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [assignments, setAssignments] = useState<CalendarAssignments>({});
  const [isSchedulingStarted, setIsSchedulingStarted] = useState(false);
  const today = new Date();
  const weeksMatrix = generateCalendarMatrix(currentMonth);
  const dayOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startOfToday = startOfDay(today);

  const cardIdToTitle: Record<string, string> = cards.reduce((acc: any, card) => {
    acc[card.id] = card.title;
    return acc;
  }, {});

  const handleDropCard = (date: Date, cardId: string) => {
    const title = cardIdToTitle[cardId];
    if (!title) return;

    const dateKey = format(date, 'yyyy-MM-dd');
    setAssignments((prev) => {
      const existing = prev[dateKey] || [];
      if (!existing.includes(title)) {
        return {
          ...prev,
          [dateKey]: [...existing, title],
        };
      }
      return prev;
    });
  };

  const handleRemoveCard = (date: Date, cardTitle: string) => {
    if (isSchedulingStarted) return; // Prevent removal if scheduling has started
    const dateKey = format(date, 'yyyy-MM-dd');
    setAssignments((prev) => {
      const existing = prev[dateKey] || [];
      const updated = existing.filter((t) => t !== cardTitle);
      return {
        ...prev,
        [dateKey]: updated,
      };
    });
  };

  // Add function to check if a date is in a past month
  const isPastMonth = (date: Date) => {
    const today = new Date();
    return date.getFullYear() < today.getFullYear() ||
      (date.getFullYear() === today.getFullYear() && date.getMonth() < today.getMonth());
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col md:flex-row">
      {/* Left Panel */}
      <div className="w-full md:w-1/3 bg-gray-50 p-4 border-r border-gray-200 h-screen flex flex-col justify-between">
        <div>
          {/* New Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-blue-600 font-['Montserrat']" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Quintara
            </h1>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-12 h-12"  // Increased size from default
                }
              }}
            />
          </div>
          
          <h2 className="text-lg font-bold mb-4">Selected Posts</h2>
          <div className="space-y-4 mb-4">
            {cards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('cardId', card.id)}
                className="p-4 bg-blue-100 rounded shadow hover:shadow-lg transition-shadow cursor-move"
              >
                <h3 className="text-blue-800 font-semibold">{card.title}</h3>
              </div>
            ))}
          </div>
        </div>
        <button
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 w-full text-lg"
          onClick={() => navigate('/generate-posts')}
        >
          Generate Posts
        </button>
      </div>

      {/* Calendar Section */}
      <div className="w-full md:w-2/3 h-screen flex flex-col">
        {/* Fixed Header */}
        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentMonth(getPreviousMonth(currentMonth))}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Prev
            </button>
            <h2 className="text-lg font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
            <button
              onClick={() => setCurrentMonth(getNextMonth(currentMonth))}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center font-medium mb-2">
            {dayOfWeekLabels.map((dow) => (
              <div key={dow} className="uppercase text-xs text-gray-500 tracking-wider">
                {dow}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Calendar Area */}
        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="flex flex-col gap-2">
            {weeksMatrix.map((weekDates, wIndex) => (
              <div key={wIndex} className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const isCurrent = isSameMonth(date, currentMonth);
                  const isInPastMonth = isPastMonth(date);
                  const isPast = isCurrent && isBefore(date, startOfToday) && !isSameDay(date, startOfToday);
                  const cardTitles = assignments[dateKey] || [];
                  const dayNumber = date.getDate();
                  const cellCursor = (isPast || isInPastMonth) ? 'cursor-not-allowed opacity-80' : 'cursor-pointer';
                  const dayTextClass = isCurrent ? 'text-gray-800' : 'text-gray-400';
                  const cardStyle = isSchedulingStarted ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800';

                  return (
                    <div
                      key={dateKey}
                      className={`group relative border border-gray-300 bg-white hover:bg-gray-50 flex flex-col p-2 
                        ${cellCursor} rounded-md aspect-square 
                        ${isInPastMonth ? 'bg-gray-50' : ''}`}
                      onDragOver={(e) => !isPast && !isSchedulingStarted && !isInPastMonth && e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!isPast && !isSchedulingStarted && !isInPastMonth) {
                          const cardId = e.dataTransfer.getData('cardId');
                          handleDropCard(date, cardId);
                        }
                      }}
                    >
                      {(isPast || isInPastMonth) && (
                        <div className="absolute right-1 top-1 text-xs text-red-500">
                          {isInPastMonth ? 'PAST MONTH' : 'PAST'}
                        </div>
                      )}
                      <div className={`text-sm font-medium ${dayTextClass}`}>{dayNumber}</div>
                      <div className="mt-auto flex flex-col gap-1">
                        {cardTitles.map((title) => (
                          <div 
                            key={title} 
                            className={`relative text-xs px-2 py-1 rounded group hover:bg-opacity-80 ${cardStyle}`}
                          >
                            <span>{title}</span>
                            {!isSchedulingStarted && (
                              <button
                                onClick={() => handleRemoveCard(date, title)}
                                className="absolute top-0 right-0 text-red-600 opacity-0 group-hover:opacity-100 px-1 hover:text-red-800"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Footer with Scheduling Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => !isSchedulingStarted && setIsSchedulingStarted(true)}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium transition-colors ${
              isSchedulingStarted 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isSchedulingStarted}
          >
            {isSchedulingStarted ? 'Scheduling Started' : 'Start Scheduling'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;