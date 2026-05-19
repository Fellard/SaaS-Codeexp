
import React, { useState } from 'react';
import { useTranslation } from '@/i18n/useTranslation.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ContactForm = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success(t('common.message.success') || "Message envoyé avec succès");
      e.target.reset();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">{t('contact.fullName')}</Label>
        <Input 
          id="name" 
          required 
          placeholder={t('contact.fullNamePlaceholder')} 
          className="bg-background"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">{t('contact.email')}</Label>
        <Input 
          id="email" 
          type="email" 
          required 
          placeholder={t('contact.emailPlaceholder')} 
          className="bg-background"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">{t('contact.subject')}</Label>
        <Input 
          id="subject" 
          required 
          placeholder={t('contact.subjectPlaceholder')} 
          className="bg-background"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">{t('contact.message')}</Label>
        <Textarea 
          id="message" 
          required 
          placeholder={t('contact.messagePlaceholder')} 
          rows={5} 
          className="bg-background resize-none"
        />
      </div>
      
      <Button type="submit" className="w-full h-12 text-lg font-medium" disabled={loading}>
        {loading ? "..." : t('contact.submit')}
      </Button>
    </form>
  );
};

export default ContactForm;
