'use client';

import React, { useState } from 'react';

interface SearchProps {
  onSearch?: (query: string) => void;
}

const Search: React.FC<SearchProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <div className="relative flex items-center">
        <button
          type="submit"
          className="absolute left-2 text-gray-500 hover:text-gray-700"
          aria-label="search"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-full bg-blue-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-50"
        />
      </div>
    </form>
  );
};

export default Search;
