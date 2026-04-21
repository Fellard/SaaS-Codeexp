import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, Users, FileText, Clock } from 'lucide-react';
import { format } from 'date-fns';

const InteractionHistoryComponent = ({ clientId }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInteractions();
  }, [clientId]);

  const fetchInteractions = async () => {
    try {
      const records = await pb.collection('crm_interactions').getFullList({
        filter: `client_id = "${clientId}"`,
        sort: '-date',
        requestKey: null
      });
      setInteractions(records);
    } catch (error) {
      console.error('Failed to fetch interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      call: Phone,
      email: Mail,
      meeting: Users,
      note: FileText
    };
    const Icon = icons[type] || FileText;
    return Icon;
  };

  const getTypeColor = (type) => {
    const colors = {
      call: 'bg-blue-100 text-blue-600',
      email: 'bg-green-100 text-green-600',
      meeting: 'bg-purple-100 text-purple-600',
      note: 'bg-slate-100 text-slate-600'
    };
    return colors[type] || colors.note;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : interactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No interactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interactions.map((interaction) => {
              const Icon = getTypeIcon(interaction.type);
              return (
                <div
                  key={interaction.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(interaction.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-900 capitalize">{interaction.type}</span>
                        <span className="text-sm text-slate-600">
                          {format(new Date(interaction.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-slate-700 mb-2">{interaction.description}</p>
                      {interaction.notes && (
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                          {interaction.notes}
                        </p>
                      )}
                    </div>
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

export default InteractionHistoryComponent;