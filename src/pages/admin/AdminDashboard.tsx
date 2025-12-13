import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Blog',
      description: 'Zarządzaj wpisami blogowymi',
      icon: FileText,
      link: '/admin/blog',
      color: 'bg-blue-500',
    },
    {
      title: 'Statystyki',
      description: 'Zobacz statystyki aplikacji',
      icon: BarChart,
      link: '/admin/stats',
      color: 'bg-green-500',
      disabled: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Panel Administracyjny
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Witaj, {user?.username}! ({user?.role === 'admin' ? 'Administrator' : 'Edytor'})
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${card.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-shadow cursor-pointer'}`}>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${card.color} text-white mb-4`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {card.description}
              </p>
            </div>
          );

          if (card.disabled) {
            return <div key={card.title}>{content}</div>;
          }

          return (
            <Link key={card.title} to={card.link}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
