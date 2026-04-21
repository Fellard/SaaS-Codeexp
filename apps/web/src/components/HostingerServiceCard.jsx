
import React from 'react';

const HostingerServiceCard = ({ icon: Icon, title, description, className = '', children }) => {
  return (
    <div className={`bg-card p-8 rounded-2xl border border-border hover-card-effect flex flex-col h-full ${className}`}>
      <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 shrink-0">
        <Icon className="w-8 h-8 text-accent" />
      </div>
      <h3 className="text-2xl font-bold text-primary mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed flex-grow text-lg">{description}</p>
      {children && (
        <div className="mt-8 pt-6 border-t border-border/50 w-full flex flex-col gap-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default HostingerServiceCard;
