import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Trash2, UserCog, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit Role State
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('users').getFullList({
        sort: '-created',
        requestKey: null
      });
      setUsers(records);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await pb.collection('users').delete(id, { requestKey: null });
      setUsers(users.filter(u => u.id !== id));
      toast.success('Utilisateur supprimé avec succès');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingUser || !newRole) return;
    
    setIsUpdating(true);
    try {
      const updatedUser = await pb.collection('users').update(editingUser.id, {
        role: newRole
      }, { requestKey: null });
      
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
      toast.success('Rôle mis à jour avec succès');
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error('Erreur lors de la mise à jour du rôle');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Gestion des Utilisateurs - Admin IWS</title>
      </Helmet>
      
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
            <p className="text-slate-500 mt-1">Gérez les comptes et les rôles de la plateforme</p>
          </div>
          <Button onClick={fetchUsers} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-12 text-center flex flex-col items-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">{error}</h3>
                <Button onClick={fetchUsers} variant="outline">Réessayer</Button>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-slate-500">Aucun utilisateur trouvé.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold text-slate-900">Nom</TableHead>
                      <TableHead className="font-semibold text-slate-900">Email</TableHead>
                      <TableHead className="font-semibold text-slate-900">Rôle</TableHead>
                      <TableHead className="font-semibold text-slate-900">Vérifié</TableHead>
                      <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900">
                          {user.nom} {user.prenom}
                        </TableCell>
                        <TableCell className="text-slate-600">{user.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                              user.role === 'etudiant' ? 'bg-blue-100 text-blue-800' : 
                              user.role === 'artiste' ? 'bg-amber-100 text-amber-800' : 
                              'bg-emerald-100 text-emerald-800'}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-emerald-600 text-sm font-medium">
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            Oui
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(user)}
                              className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                              title="Modifier le rôle"
                            >
                              <UserCog className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(user.id)}
                              className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Changez le rôle de {editingUser?.nom} {editingUser?.prenom} ({editingUser?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="etudiant">Étudiant(e)</SelectItem>
                <SelectItem value="artiste">Artiste</SelectItem>
                <SelectItem value="client">Client(e)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              Annuler
            </Button>
            <Button onClick={handleUpdateRole} disabled={isUpdating || newRole === editingUser?.role} className="bg-indigo-600 hover:bg-indigo-700">
              {isUpdating ? 'Mise à jour...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;