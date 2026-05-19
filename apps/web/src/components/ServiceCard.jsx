
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ServiceCard = ({ title, description, icon: Icon, link, linkText = "En savoir plus" }) => {
  return (
    <div className="group bg-white rounded-2xl p-8 border border-border hover:border-accent shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
        <Icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
      </div>
      <h3 className="text-xl font-bold text-primary mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6 flex-grow">{description}</p>
      {link && (
        <Link 
          to={link} 
          className="inline-flex items-center gap-2 text-primary font-medium group-hover:text-accent transition-colors mt-auto"
        >
          {linkText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
};

export default ServiceCard;
