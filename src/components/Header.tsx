import React from 'react';
import { Link } from 'react-router-dom';
import { Video, History, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Video className="w-8 h-8 text-indigo-600" />
            <span className="font-bold text-xl">PIB-Insights</span>
          </Link>
          
          <nav className="flex space-x-4">
            <Link
              to="/history"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}