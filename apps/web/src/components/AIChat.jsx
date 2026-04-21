import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import AIMessage from './AIMessage.jsx';

const AIChat = ({ messages, onSendMessage, isLoading, onClear }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{t('IWS Assistant')}</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">{t('Online')}</span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClear} 
          title="Clear chat history" 
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col justify-end min-h-full">
          {messages.map((msg, i) => (
            <AIMessage key={i} message={msg} />
          ))}
          
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground p-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                <Sparkles size={14} className="animate-pulse" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm border border-border flex gap-1.5 items-center h-[44px]">
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t bg-background">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('Ask me anything...')}
            className="rounded-full bg-muted/50 border-transparent focus-visible:ring-primary/20 text-foreground"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading} 
            className={`rounded-full shrink-0 transition-transform active:scale-95 ${isRtl ? 'rotate-180' : ''}`}
          >
            <Send size={16} className="ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;