import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AIMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'
          }`}
          title={isUser ? 'You' : 'IWS Assistant'}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>
        
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div 
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              isUser 
                ? 'bg-[hsl(var(--chat-user-bg))] text-[hsl(var(--chat-user-fg))] rounded-tr-sm' 
                : 'bg-[hsl(var(--chat-ai-bg))] text-[hsl(var(--chat-ai-fg))] rounded-tl-sm border border-[hsl(var(--chat-border))]'
            } ${message.isError ? 'bg-destructive text-destructive-foreground border-none' : ''}`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
          </div>
          
          {message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.actions.map((action, idx) => (
                <Button 
                  key={idx} 
                  variant={isUser ? "default" : "outline"} 
                  size="sm" 
                  asChild 
                  className="text-xs h-8 rounded-full shadow-sm"
                >
                  <Link to={action.link}>{action.label}</Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AIMessage;