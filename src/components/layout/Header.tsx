import React from 'react';
import { Clock } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actions }) => {
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="backdrop-blur-md bg-white/90 border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm border">
              <Clock className="text-gray-400 w-4 h-4" />
              <span className="text-sm text-gray-600">{currentTime}</span>
            </div>
            {actions}
          </div>
        </div>
      </div>
    </div>
  );
};