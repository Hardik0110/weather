import { useState, useEffect, useRef } from 'react';
import { HeaderProps } from '../lib/types';
import { fetchCitySuggestions } from '../services/weatherService';
import React from 'react';

const Header = ({ onCitySearch }: HeaderProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getSuggestions = async () => {
      if (searchInput.length >= 3) {
        const citySuggestions = await fetchCitySuggestions(searchInput);
        setSuggestions(citySuggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onCitySearch(searchInput.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchInput(suggestion);
    onCitySearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-white text-2xl font-bold mb-4 md:mb-0">
          Weather Explorer
        </h1>
        <form onSubmit={handleSubmit} className="w-full md:w-auto relative">
          <div className="flex">
            <input
              type="text"
              placeholder="Search for a city..."
              className="w-full md:w-64 px-4 py-2 rounded-l outline-none"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-r transition-colors"
            >
              Search
            </button>
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionBoxRef}
              className="absolute w-full md:w-64 bg-white mt-1 rounded-md shadow-lg z-10"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </header>
  );
};

export default Header;