import React, { useState } from 'react';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import{ Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

const AddInteractionForm = ({ clientId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'note',
    description: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description) {
      toast.error('Please provide a description');
      return;
    }

    setLoading(true);
    try {
      await pb.collection('crm_interactions').create({
        client_id: clientId,
        type: formData.type,
        description: formData.description,
        notes: formData.notes,
        date: new Date().toISOString()
      }, { requestKey: null });
      
      toast.success('Interaction added successfully');
      setFormData({ type: 'note', description: '', notes: '' });
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error('Failed to add interaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Interaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Interaction Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="appel">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="reunion">Meeting</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Short)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="e.g., Follow-up call about studio booking"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Detailed Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add any additional details here..."
              rows={3}
              className="mt-1"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            {loading ? 'Adding...' : 'Add Interaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddInteractionForm;