import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const QuickShortcuts = ({ shortcuts = [], title = "Quick Actions" }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300 hover:bg-indigo-100/50',
    green: 'bg-green-50 text-green-600 border-green-100 hover:border-green-300 hover:bg-green-100/50',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300 hover:bg-purple-100/50',
    pink: 'bg-pink-50 text-pink-600 border-pink-100 hover:border-pink-300 hover:bg-pink-100/50',
    teal: 'bg-teal-50 text-teal-600 border-teal-100 hover:border-teal-300 hover:bg-teal-100/50',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300 hover:bg-blue-100/50',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300 hover:bg-orange-100/50',
    slate: 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-100/50',
  };

  return (
    <Card className="dash-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shortcuts.map((shortcut, index) => {
            const Icon = shortcut.icon;
            const styleClass = colorClasses[shortcut.color || 'slate'] || colorClasses.slate;
            
            return (
              <Link key={index} to={shortcut.path} className="block group">
                <div className={`p-4 rounded-xl border transition-all duration-200 flex flex-col h-full ${styleClass}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-white/60 flex items-center justify-center shadow-sm">
                      {Icon && <Icon className="w-5 h-5" />}
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">{shortcut.label}</h4>
                  {shortcut.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-auto">
                      {shortcut.description}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickShortcuts;