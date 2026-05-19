import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const RecentActivity = ({ activities = [], title = "Recent Activity", viewAllLink }) => {
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

  return (
    <Card className="dash-card h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <Button variant="ghost" size="sm" className="text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              View All
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <Clock className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 text-sm">No recent activity found.</p>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              const iconClass = colorClasses[activity.color || 'slate'] || colorClasses.slate;
              
              return (
                <div key={activity.id || index} className="flex items-start gap-4 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.title}
                      </p>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {activity.date ? formatDistanceToNow(new Date(activity.date), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {activity.description}
                    </p>
                    {activity.actionLink && (
                      <Link to={activity.actionLink} className="inline-flex items-center mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                        {activity.actionLabel || 'View details'}
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;