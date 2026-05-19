
import React, { useState } from 'react';
import { Globe, Server, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HostingerUrlManager = () => {
  const [urls, setUrls] = useState({
    domaine: '',
    hebergement: '',
    email: ''
  });

  const handleChange = (e) => {
    setUrls({ ...urls, [e.target.name]: e.target.value });
  };

  const handleOpen = (url) => {
    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank');
    } else {
      window.open('https://www.hostinger.fr', '_blank');
    }
  };

  return (
    <div className="space-y-4 mt-6 pt-6 border-t border-border">
      <h4 className="font-semibold text-primary text-sm uppercase tracking-wider mb-4">Accès Hostinger</h4>
      
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              name="domaine"
              value={urls.domaine}
              onChange={handleChange}
              placeholder="URL Domaine" 
              className="pl-9 bg-muted/50"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => handleOpen(urls.domaine)} title="Ouvrir">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              name="hebergement"
              value={urls.hebergement}
              onChange={handleChange}
              placeholder="URL Hébergement" 
              className="pl-9 bg-muted/50"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => handleOpen(urls.hebergement)} title="Ouvrir">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              name="email"
              value={urls.email}
              onChange={handleChange}
              placeholder="URL Email" 
              className="pl-9 bg-muted/50"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => handleOpen(urls.email)} title="Ouvrir">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostingerUrlManager;
