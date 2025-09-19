import React from 'react';
import { Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          {/* Author Information */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 BeskidScore.pl
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Stworzone przez zespół BeskidScore
            </p>
          </div>

          {/* Facebook Button */}
          <div className="flex items-center space-x-2">
            <a
              href="https://www.facebook.com/profile.php?id=61579363618910"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Visit BeskidScore Facebook page"
            >
              <Facebook className="h-4 w-4" />
              <span className="text-sm font-medium">Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;