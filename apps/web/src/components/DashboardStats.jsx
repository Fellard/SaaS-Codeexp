import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DashboardStats = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'indigo', 
  trend, 
  trendLabel,
  description 
}) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    teal: 'bg-teal-100 text-teal-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  const iconClass = colorClasses[color] || colorClasses.indigo;

  return (
    <Card className="group dash-card overflow-hidden relative">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
          </div>
          <div className={`dash-stat-icon ${iconClass}`}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>
        </div>

        {(trend !== undefined || description) && (
          <div className="flex items-center mt-4 pt-4 border-t border-slate-100">
            {trend !== undefined && (
              <div className={`flex items-center text-sm font-medium mr-3 ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-500'
              }`}>
                {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : 
                 trend < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : 
                 <Minus className="w-4 h-4 mr-1" />}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
            {(trendLabel || description) && (
              <span className="text-sm text-slate-500 truncate">
                {trendLabel || description}
              </span>
            )}
          </div>
        )}
        
        {/* Decorative background gradient */}
        <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl ${iconClass.split(' ')[0]}`}></div>
      </CardContent>
    </Card>
  );
};

export default DashboardStats;