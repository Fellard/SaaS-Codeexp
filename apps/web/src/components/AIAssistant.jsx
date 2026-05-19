import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAIAssistant } from '@/hooks/useAIAssistant.jsx';
import AIChat from './AIChat.jsx';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { messages, sendMessage, isLoading, clearHistory } = useAIAssistant(location.pathname);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 w-[calc(100vw-3rem)] sm:w-[380px] h-[550px] max-h-[calc(100vh-8rem)] bg-background border border-border chat-panel-shadow rounded-2xl overflow-hidden flex flex-col"
          >
            <AIChat
              messages={messages}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              onClear={clearHistory}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary transition-colors hover:bg-primary/90"
        aria-label={isOpen ? "Close IWS Assistant" : "Open IWS Assistant"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div 
              key="close" 
              initial={{ rotate: -90, opacity: 0 }} 
              animate={{ rotate: 0, opacity: 1 }} 
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div 
              key="open" 
              initial={{ rotate: 90, opacity: 0 }} 
              animate={{ rotate: 0, opacity: 1 }} 
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default AIAssistant;