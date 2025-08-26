import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  className,
}) => {
  return (
    <div className={clsx(
      'bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow duration-200',
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={clsx('p-3 rounded-xl', iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};