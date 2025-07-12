import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'text-primary',
  description,
}) => {
  return (
    <Card className="rewear-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${color}`}>
              {value}
            </div>
            <div className="text-gray-600">{title}</div>
            {description && (
              <div className="text-sm text-gray-500 mt-1">{description}</div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color === 'text-primary' ? 'bg-primary/10' : 'bg-gray-100'}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
