import React from 'react';
import { Link } from 'react-router-dom';
// import { Activity } from 'lucide-react';
// import { Activity, Search } from 'lucide-react';
import beskid_logo from '../../assets/beskid_logo.png';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={beskid_logo} alt="Logo" className="h-12 w-12" />
            {/*<Activity className="h-8 w-8 text-primary-600" />*/}
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              BeskidScore
            </span>
          </Link>

          {/* Search Bar */}
          {/*<div className="flex-1 max-w-lg mx-8">*/}
          {/*  <div className="relative">*/}
          {/*    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">*/}
          {/*      <Search className="h-5 w-5 text-gray-400" />*/}
          {/*    </div>*/}
          {/*    <input*/}
          {/*      type="text"*/}
          {/*      placeholder="Search teams, leagues, matches..."*/}
          {/*      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*</div>*/}

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;