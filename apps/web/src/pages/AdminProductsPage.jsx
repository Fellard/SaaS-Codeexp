import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import { useTranslation } from '@/i18n/useTranslation.js';
import AdminLayout from '@/components/AdminLayout.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Download, FilterX, Plus, ImagePlus, Package, X } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

const EMPTY_FORM = {
  id: '', name: '', category: '', price: 0, stock: 0,
  section: 'pc', description: '', brand: '', condition: 'neuf',
  image_url: '', image_url_2: '', image_url_3: '', image_url_4: ''
};

const AdminProductsPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sectionFilter = searchParams.get('section') || 'all';
  const sectionTitle = sectionFilter === 'musik' ? t('admin.nav.products.music', '🎸 Instruments de Musique')
                     : sectionFilter === 'pc' ? t('admin.nav.products.computers', '💻 Informatique / PC')
                     : t('admin.nav.products', 'Tous les Produits');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imagePreviews, setImagePreviews] = useState(['', '', '', '']);
  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await pb.collection('products').getFullList({ sort: '-created', requestKey: null });
      setProducts(res);
    } catch (error) {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newFiles = [...imageFiles];
    newFiles[index] = file;
    setImageFiles(newFiles);
    const newPreviews = [...imagePreviews];
    newPreviews[index] = URL.createObjectURL(file);
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);
    const newPreviews = [...imagePreviews];
    newPreviews[index] = '';
    setImagePreviews(newPreviews);
    const keys = ['image_url', 'image_url_2', 'image_url_3', 'image_url_4'];
    setFormData({...formData, [keys[index]]: ''});
  };

  const convertToBase64 = (file) => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...formData };
      const keys = ['image_url', 'image_url_2', 'image_url_3', 'image_url_4'];

      // Convertir les fichiers en base64
      for (let i = 0; i < 4; i++) {
        if (imageFiles[i]) {
          data[keys[i]] = await convertToBase64(imageFiles[i]);
        }
      }

      if (formData.id) {
        await pb.collection('products').update(formData.id, data, { requestKey: null });
        toast.success('Produit mis à jour ✓');
      } else {
        await pb.collection('products').create(data, { requestKey: null });
        toast.success('Produit ajouté ✓');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Save error details:', error.response?.data);
      toast.error('Erreur : ' + (JSON.stringify(error.response?.data) || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.products.confirmDelete', 'Supprimer ce produit ?'))) {
      try {
        await pb.collection('products').delete(id, { requestKey: null });
        toast.success('Produit supprimé');
        fetchProducts();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const openModal = (product = null) => {
    setImageFiles([null, null, null, null]);
    if (product) {
      setFormData(product);
      setImagePreviews([
        product.image_url || '',
        product.image_url_2 || '',
        product.image_url_3 || '',
        product.image_url_4 || ''
      ]);
    } else {
      setFormData(EMPTY_FORM);
      setImagePreviews(['', '', '', '']);
    }
    setIsModalOpen(true);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(filteredProducts.map(p => ({
      Nom: p.name, Catégorie: p.category, Prix: p.price,
      Stock: p.stock, Description: p.description, Marque: p.brand
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Export CSV réussi');
  };

  const filteredProducts = products.filter(p => {
    const matchesSection = sectionFilter === 'all' || p.section === sectionFilter;
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const getMainImage = (product) => product.image_url || null;

  const ImageSlot = ({ index }) => (
    <div className="relative">
      <div className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted group hover:border-accent transition-colors">
        {imagePreviews[index] ? (
          <>
            <img src={imagePreviews[index]} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="text-center p-2">
            <ImagePlus className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
            <span className="text-xs text-muted-foreground">Image {index + 1}</span>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(index, e)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );

  return (
    <AdminLayout>
      <Helmet><title>Produits - Admin IWS</title></Helmet>

      <div className="space-y-6 animate-slide-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">{sectionTitle}</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV} className="gap-2">
              <Download className="w-4 h-4" /> {t('admin.products.export', 'Exporter CSV')}
            </Button>
            <Button onClick={() => openModal()} className="gap-2">
              <Plus className="w-4 h-4" /> {t('admin.products.add', 'Ajouter un produit')}
            </Button>
          </div>
        </div>

        <Card className="dashboard-card">
          <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 items-center justify-between bg-muted/20">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={t('admin.products.search', 'Rechercher...')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-background" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filteredProducts.length} {t('admin.products.results', 'produit(s)')}</span>
              {searchTerm && (
                <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')} className="h-8 px-2 text-xs">
                  <FilterX className="w-3 h-3 mr-1" /> {t('common.reset', 'Réinitialiser')}
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th className="w-16">{t('admin.products.image', 'Image')}</th>
                    <th>{t('admin.products.name', 'Nom')}</th>
                    <th>{t('admin.products.category', 'Catégorie')}</th>
                    <th>{t('admin.products.price', 'Prix')}</th>
                    <th>{t('admin.products.stock', 'Stock')}</th>
                    <th className="text-right">{t('admin.products.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center py-8 text-muted-foreground">{t('common.loading', 'Chargement...')}</td></tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-muted-foreground">
                        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>{t('admin.products.noProducts', 'Aucun produit trouvé')}</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td>
                          {getMainImage(p) ? (
                            <img src={getMainImage(p)} alt={p.name} className="w-12 h-12 object-cover rounded-lg border border-border" />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="font-medium">{p.name}</div>
                          {p.description && <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{p.description}</div>}
                        </td>
                        <td><span className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-md text-xs font-medium">{p.category}</span></td>
                        <td className="font-mono font-semibold">{p.price} MAD</td>
                        <td>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {p.stock > 0 ? `${p.stock} ${t('admin.products.inStock', 'en stock')}` : t('admin.products.outOfStock', 'Rupture')}
                          </span>
                        </td>
                        <td className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openModal(p)}>{t('admin.products.edit', 'Éditer')}</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>{t('admin.products.delete', 'Supprimer')}</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id ? '✏️ Éditer le produit' : '➕ Ajouter un produit'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-5 pt-2">

              {/* 4 Images */}
              <div className="space-y-2">
                <Label>Photos du produit <span className="text-muted-foreground text-xs">(jusqu'à 4 photos — cliquez pour ajouter)</span></Label>
                <div className="grid grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map(i => <ImageSlot key={i} index={i} />)}
                </div>
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <Label>Nom du produit *</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background" />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Décrivez le produit..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Catégorie + Marque */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="Ex: Informatique" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Marque</Label>
                  <Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Ex: Samsung, Apple..." className="bg-background" />
                </div>
              </div>

              {/* Prix, Stock, État */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Prix (MAD) *</Label>
                  <Input type="number" min="0" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Stock *</Label>
                  <Input type="number" min="0" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>État</Label>
                  <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})}
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="neuf">Neuf</option>
                    <option value="occasion">Occasion</option>
                  </select>
                </div>
              </div>

              {/* Section */}
              <div className="space-y-2">
                <Label>Section</Label>
                <select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="pc">Informatique / PC</option>
                  <option value="musik">Musique / Instruments</option>
                  <option value="studio">Studio</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Sauvegarde...' : (formData.id ? 'Mettre à jour' : 'Ajouter le produit')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProductsPage;
