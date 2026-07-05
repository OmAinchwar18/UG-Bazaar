import React, { useState, useEffect } from 'react';
import { apiClient, getProductThumbnail, API_BASE, getTranslated } from '@ugbazaar/shared';
import { useTranslation } from '../hooks/useTranslation';
import { Plus, Edit3, Trash2, UploadCloud, Star, Sparkles, X, Trash } from 'lucide-react';

interface AdminProduct {
  _id: string;
  name: any;
  price: number;
  mrp: number;
  purchasePrice?: number;
  stock: number;
  minStockLevel: number;
  sku?: string;
  supplierName?: string;
  dept: string;
  category?: any;
  badge?: string;
  images: Array<{ url: string; isPrimary: boolean }>;
  description?: any;
  specifications?: Array<{ key: any; value: any }>;
  features?: Array<any>;
  isActive?: boolean;
}

export default function Products() {
  const { currentDict, lang } = useTranslation();
  const [productsList, setProductsList] = useState<AdminProduct[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  // Forms
  const [pmNameEn, setPmNameEn] = useState('');
  const [pmNameHi, setPmNameHi] = useState('');
  const [pmNameMr, setPmNameMr] = useState('');

  const [pmPrice, setPmPrice] = useState('');
  const [pmMrp, setPmMrp] = useState('');
  const [pmStock, setPmStock] = useState('');
  const [pmMinStock, setPmMinStock] = useState('5');
  const [pmSku, setPmSku] = useState('');
  const [pmSupplier, setPmSupplier] = useState('Local Supplier');
  const [pmDept, setPmDept] = useState('Grocery');

  const [pmCatEn, setPmCatEn] = useState('');
  const [pmCatHi, setPmCatHi] = useState('');
  const [pmCatMr, setPmCatMr] = useState('');

  const [pmBadge, setPmBadge] = useState('');

  const [pmDescEn, setPmDescEn] = useState('');
  const [pmDescHi, setPmDescHi] = useState('');
  const [pmDescMr, setPmDescMr] = useState('');

  const [pmSpecs, setPmSpecs] = useState<Array<{ key: { en: string; hi: string; mr: string }; value: { en: string; hi: string; mr: string } }>>([]);
  const [pmFeatures, setPmFeatures] = useState<Array<{ en: string; hi: string; mr: string }>>([]);

  const [imagesList, setImagesList] = useState<Array<{ url: string; isPrimary: boolean }>>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await apiClient('/products?limit=100');
      if (res.success && res.products) {
        setProductsList(res.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAiTranslate = async () => {
    if (!pmNameEn.trim()) {
      alert('Please enter English Name first');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await apiClient('/admin/translate', {
        method: 'POST',
        body: JSON.stringify({
          name: pmNameEn,
          description: pmDescEn,
          category: pmDept,
          features: pmFeatures.map(f => f.en),
          specifications: pmSpecs.map(s => ({ key: s.key.en, value: s.value.en }))
        })
      });
      if (res.success && res.translations) {
        setPmNameHi(res.translations.hi.name || '');
        setPmNameMr(res.translations.mr.name || '');
        setPmDescHi(res.translations.hi.description || '');
        setPmDescMr(res.translations.mr.description || '');
        setPmCatHi(res.translations.hi.category || '');
        setPmCatMr(res.translations.mr.category || '');
        
        if (res.translations.hi.features && res.translations.mr.features) {
          const transFeats = pmFeatures.map((f, i) => ({
            en: f.en,
            hi: res.translations.hi.features[i] || f.en,
            mr: res.translations.mr.features[i] || f.en
          }));
          setPmFeatures(transFeats);
        }

        if (res.translations.hi.specifications && res.translations.mr.specifications) {
          const transSpecs = pmSpecs.map((s, i) => {
            const hiSpec = res.translations.hi.specifications[i] || {};
            const mrSpec = res.translations.mr.specifications[i] || {};
            return {
              key: { en: s.key.en, hi: hiSpec.key || s.key.en, mr: mrSpec.key || s.key.en },
              value: { en: s.value.en, hi: hiSpec.value || s.value.en, mr: mrSpec.value || s.value.en }
            };
          });
          setPmSpecs(transSpecs);
        }
      }
    } catch (err: any) {
      alert(`Translation failed: ${err.message}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const openProductModal = (prod: AdminProduct | null) => {
    setUploadError(null);
    if (prod) {
      setEditProductId(prod._id);
      setPmNameEn(typeof prod.name === 'object' ? prod.name.en : prod.name || '');
      setPmNameHi(typeof prod.name === 'object' ? prod.name.hi : '');
      setPmNameMr(typeof prod.name === 'object' ? prod.name.mr : '');

      setPmPrice(prod.price.toString());
      setPmMrp(prod.mrp ? prod.mrp.toString() : '');
      setPmStock(prod.stock.toString());
      setPmMinStock(prod.minStockLevel ? prod.minStockLevel.toString() : '5');
      setPmSku(prod.sku || '');
      setPmSupplier(prod.supplierName || 'Local Supplier');
      setPmDept(prod.dept);

      setPmCatEn(typeof prod.category === 'object' ? prod.category.en : prod.dept || '');
      setPmCatHi(typeof prod.category === 'object' ? prod.category.hi : '');
      setPmCatMr(typeof prod.category === 'object' ? prod.category.mr : '');

      setPmBadge(prod.badge || '');

      setPmDescEn(typeof prod.description === 'object' ? prod.description.en : prod.description || '');
      setPmDescHi(typeof prod.description === 'object' ? prod.description.hi : '');
      setPmDescMr(typeof prod.description === 'object' ? prod.description.mr : '');

      setPmSpecs(prod.specifications || []);
      setPmFeatures(prod.features || []);

      setImagesList(prod.images || []);
    } else {
      setEditProductId(null);
      setPmNameEn('');
      setPmNameHi('');
      setPmNameMr('');

      setPmPrice('');
      setPmMrp('');
      setPmStock('');
      setPmMinStock('5');
      setPmSku('');
      setPmSupplier('Local Supplier');
      setPmDept('Grocery');

      setPmCatEn('Grocery');
      setPmCatHi('');
      setPmCatMr('');

      setPmBadge('');

      setPmDescEn('');
      setPmDescHi('');
      setPmDescMr('');

      setPmSpecs([]);
      setPmFeatures([]);

      setImagesList([]);
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmNameEn.trim() || !pmPrice || !pmStock) return;

    if (imagesList.length === 0) {
      setUploadError('At least one product image is mandatory.');
      return;
    }

    const payload = {
      name: {
        en: pmNameEn,
        hi: pmNameHi || pmNameEn,
        mr: pmNameMr || pmNameEn
      },
      price: parseFloat(pmPrice),
      mrp: pmMrp ? parseFloat(pmMrp) : parseFloat(pmPrice),
      stock: parseInt(pmStock),
      minStockLevel: parseInt(pmMinStock),
      sku: pmSku || undefined,
      supplierName: pmSupplier,
      dept: pmDept,
      category: {
        en: pmCatEn || pmDept,
        hi: pmCatHi || pmCatEn || pmDept,
        mr: pmCatMr || pmCatEn || pmDept
      },
      badge: pmBadge || '',
      images: imagesList,
      description: {
        en: pmDescEn,
        hi: pmDescHi || pmDescEn,
        mr: pmDescMr || pmDescEn
      },
      specifications: pmSpecs,
      features: pmFeatures
    };

    try {
      let res;
      if (editProductId) {
        res = await apiClient(`/products/${editProductId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        res = await apiClient('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      if (res.success) {
        setIsProductModalOpen(false);
        setEditProductId(null);
        loadProducts();
      }
    } catch (err) {
      const error = err as Error;
      alert(`Save failed: ${error.message}`);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    setUploadError(null);
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (imagesList.length + files.length > 8) {
      setUploadError('Maximum of 8 images allowed per product.');
      setUploading(false);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`File type of "${file.name}" is not supported. Only JPG, JPEG, PNG, and WebP are allowed.`);
        setUploading(false);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 5 MB size limit.`);
        setUploading(false);
        return;
      }
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const token = localStorage.getItem('ug_token');
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      if (data.success && data.urls) {
        const newImgs = data.urls.map((url: string, idx: number) => ({
          url,
          isPrimary: imagesList.length === 0 && idx === 0
        }));
        setImagesList([...imagesList, ...newImgs]);
      }
    } catch (err) {
      const error = err as Error;
      setUploadError(error.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const updated = [...imagesList];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    const finalImages = updated.map((img, idx) => ({
      ...img,
      isPrimary: idx === 0
    }));
    setImagesList(finalImages);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveImage = (index: number) => {
    const updated = imagesList.filter((_, idx) => idx !== index);
    const finalImages = updated.map((img, idx) => ({
      ...img,
      isPrimary: idx === 0
    }));
    setImagesList(finalImages);
  };

  const togglePrimaryImage = (index: number) => {
    const updated = imagesList.map((img, idx) => ({
      ...img,
      isPrimary: idx === index
    }));
    const primaryItem = updated[index];
    const remaining = updated.filter((_, idx) => idx !== index);
    const finalImages = [primaryItem, ...remaining].map((img, idx) => ({
      ...img,
      isPrimary: idx === 0
    }));
    setImagesList(finalImages);
  };

  // Specs helper rows
  const addSpecRow = () => {
    setPmSpecs([...pmSpecs, { key: { en: '', hi: '', mr: '' }, value: { en: '', hi: '', mr: '' } }]);
  };
  const removeSpecRow = (index: number) => {
    setPmSpecs(pmSpecs.filter((_, i) => i !== index));
  };
  const updateSpecKey = (index: number, fld: 'en' | 'hi' | 'mr', val: string) => {
    const updated = [...pmSpecs];
    updated[index].key[fld] = val;
    setPmSpecs(updated);
  };
  const updateSpecValue = (index: number, fld: 'en' | 'hi' | 'mr', val: string) => {
    const updated = [...pmSpecs];
    updated[index].value[fld] = val;
    setPmSpecs(updated);
  };

  // Features helper rows
  const addFeatureRow = () => {
    setPmFeatures([...pmFeatures, { en: '', hi: '', mr: '' }]);
  };
  const removeFeatureRow = (index: number) => {
    setPmFeatures(pmFeatures.filter((_, i) => i !== index));
  };
  const updateFeatureVal = (index: number, fld: 'en' | 'hi' | 'mr', val: string) => {
    const updated = [...pmFeatures];
    updated[index][fld] = val;
    setPmFeatures(updated);
  };

  return (
    <div className="bg-white border border-brand-border/60 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
      <div className="flex items-center justify-between border-b border-brand-light pb-4">
        <h2 className="font-extrabold text-lg text-brand-dark">
          {lang === 'hi' ? 'उत्पाद कैटलॉग सेटिंग्स' : lang === 'mr' ? 'उत्पादन कॅटलॉग सेटिंग्ज' : 'Product Catalog settings'}
        </h2>
        <button 
          onClick={() => openProductModal(null)}
          className="btn-primary py-2.5 px-4 text-xs font-bold cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'hi' ? 'उत्पाद जोड़ें' : lang === 'mr' ? 'उत्पादन जोडा' : 'Add Product'}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border text-xs font-bold text-brand-muted uppercase bg-brand-light/35">
              <th className="py-4 px-4">{lang === 'hi' ? 'नाम' : lang === 'mr' ? 'नाव' : 'Name'}</th>
              <th className="py-4 px-4">SKU</th>
              <th className="py-4 px-4">{lang === 'hi' ? 'विभाग' : lang === 'mr' ? 'विभाग' : 'Department'}</th>
              <th className="py-4 px-4 text-right">{lang === 'hi' ? 'बिक्री मूल्य (₹)' : lang === 'mr' ? 'विक्री किंमत (₹)' : 'Selling (₹)'}</th>
              <th className="py-4 px-4 text-right">{lang === 'hi' ? 'खरीद मूल्य (₹)' : lang === 'mr' ? 'खरेदी किंमत (₹)' : 'Purchase (₹)'}</th>
              <th className="py-4 px-4 text-center">{lang === 'hi' ? 'स्टॉक' : lang === 'mr' ? 'स्टॉक' : 'Stock'}</th>
              <th className="py-4 px-4 text-center">{lang === 'hi' ? 'कार्रवाई' : lang === 'mr' ? 'कृती' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light text-sm font-semibold">
            {productsList.map((p) => (
              <tr key={p._id} className="hover:bg-brand-light/30">
                <td className="py-4 px-4 flex items-center gap-2">
                  {getProductThumbnail(p.images) ? (
                    <img src={getProductThumbnail(p.images)} alt={getTranslated(p.name, lang)} className="w-8 h-8 object-contain rounded-lg border bg-brand-light" />
                  ) : (
                    <span className="text-xl">🛍</span>
                  )}
                  <span className="font-extrabold text-brand-dark">{getTranslated(p.name, lang)}</span>
                </td>
                <td className="py-4 px-4 font-mono text-xs">{p.sku || 'N/A'}</td>
                <td className="py-4 px-4">{p.dept}</td>
                <td className="py-4 px-4 text-right font-extrabold text-brand-dark">₹{p.price}</td>
                <td className="py-4 px-4 text-right">₹{p.purchasePrice || 0}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    p.stock <= (p.minStockLevel || 5) ? 'bg-red-50 text-red-600 border border-red-150 animate-pulse' : 'bg-green-50 text-brand-green'
                  }`}>
                    {p.stock <= (p.minStockLevel || 5) ? '⚠️ ' : ''}{p.stock} Units
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <button onClick={() => openProductModal(p)} className="text-brand-muted hover:text-brand-green cursor-pointer">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-brand-border shadow-2xl rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-lg text-brand-dark">
                {editProductId ? 'Edit Product Details' : 'Add New Product'}
              </h3>
              <button 
                type="button"
                onClick={handleAiTranslate}
                disabled={isTranslating}
                className="text-xs bg-brand-green/10 text-brand-green border border-brand-green/20 px-3 py-1.5 rounded-xl hover:bg-brand-green hover:text-white transition-all font-black cursor-pointer inline-flex items-center gap-1 active:scale-95 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTranslating ? 'Translating...' : '✨ AI Auto-Translate'}</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="space-y-5">
              
              {/* Localized Names */}
              <div className="border border-brand-border/60 p-4 rounded-2xl bg-brand-light/10 space-y-3">
                <span className="text-[10px] font-black text-brand-muted uppercase block">Product Name translations</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-dark">English (en) *</label>
                    <input
                      type="text"
                      value={pmNameEn}
                      onChange={(e) => setPmNameEn(e.target.value)}
                      className="w-full bg-white border rounded-xl px-3 py-2 text-xs outline-none font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-dark">Hindi (hi)</label>
                    <input
                      type="text"
                      value={pmNameHi}
                      onChange={(e) => setPmNameHi(e.target.value)}
                      className="w-full bg-white border rounded-xl px-3 py-2 text-xs outline-none font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-dark">Marathi (mr)</label>
                    <input
                      type="text"
                      value={pmNameMr}
                      onChange={(e) => setPmNameMr(e.target.value)}
                      className="w-full bg-white border rounded-xl px-3 py-2 text-xs outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Department</label>
                  <select
                    value={pmDept}
                    onChange={(e) => setPmDept(e.target.value)}
                    className="w-full bg-brand-light border rounded-xl px-4 py-2 text-sm outline-none font-semibold"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Building Materials">Building Materials</option>
                    <option value="Hardware Tools">Hardware Tools</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Home Appliances">Home Appliances</option>
                    <option value="Electronics">Electronics</option>
                    <option value="General Store">General Store</option>
                  </select>
                </div>

                {/* Localized Category Labels */}
                <div className="border border-brand-border/60 p-3.5 rounded-xl bg-brand-light/10 space-y-1.5">
                  <span className="text-[9px] font-black text-brand-muted uppercase block">Category Translations (Custom label)</span>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={pmCatEn}
                      onChange={(e) => setPmCatEn(e.target.value)}
                      placeholder="en"
                      className="w-full bg-white border rounded-lg px-2 py-1.5 text-xs outline-none font-semibold"
                    />
                    <input
                      type="text"
                      value={pmCatHi}
                      onChange={(e) => setPmCatHi(e.target.value)}
                      placeholder="hi"
                      className="w-full bg-white border rounded-lg px-2 py-1.5 text-xs outline-none font-semibold"
                    />
                    <input
                      type="text"
                      value={pmCatMr}
                      onChange={(e) => setPmCatMr(e.target.value)}
                      placeholder="mr"
                      className="w-full bg-white border rounded-lg px-2 py-1.5 text-xs outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">SKU (Unique Identifier)</label>
                  <input
                    type="text"
                    value={pmSku}
                    onChange={(e) => setPmSku(e.target.value)}
                    placeholder="e.g. GROC-RICE-001"
                    className="w-full bg-brand-light border rounded-xl px-4 py-2 text-sm outline-none font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Supplier Name</label>
                  <input
                    type="text"
                    value={pmSupplier}
                    onChange={(e) => setPmSupplier(e.target.value)}
                    placeholder="Local Supplier"
                    className="w-full bg-brand-light border rounded-xl px-4 py-2 text-sm outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={pmPrice}
                    onChange={(e) => setPmPrice(e.target.value)}
                    className="w-full bg-brand-light border rounded-xl px-3 py-2 text-sm outline-none font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">MRP (₹)</label>
                  <input
                    type="number"
                    value={pmMrp}
                    onChange={(e) => setPmMrp(e.target.value)}
                    className="w-full bg-brand-light border rounded-xl px-3 py-2 text-sm outline-none font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Stock</label>
                  <input
                    type="number"
                    value={pmStock}
                    onChange={(e) => setPmStock(e.target.value)}
                    className="w-full bg-brand-light border rounded-xl px-3 py-2 text-sm outline-none font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Min Stock Warning</label>
                  <input
                    type="number"
                    value={pmMinStock}
                    onChange={(e) => setPmMinStock(e.target.value)}
                    className="w-full bg-brand-light border rounded-xl px-4 py-2 text-sm outline-none font-semibold text-center"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-brand-muted uppercase">Promo Badge</label>
                  <select
                    value={pmBadge}
                    onChange={(e) => setPmBadge(e.target.value)}
                    className="w-full bg-brand-light border rounded-xl px-4 py-2 text-sm outline-none font-semibold"
                  >
                    <option value="">None</option>
                    <option value="Popular">Popular</option>
                    <option value="Best Buy">Best Buy</option>
                    <option value="Hot">Hot</option>
                    <option value="Farmer Pick">Farmer Pick</option>
                  </select>
                </div>
              </div>

              {/* Product Images Manager */}
              <div className="space-y-2 border border-brand-border/60 p-4 rounded-2xl bg-brand-light/10">
                <label className="text-[10px] font-bold text-brand-muted uppercase block">Product Images ({imagesList.length}/8)</label>
                <div 
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      handleFileUpload(e.dataTransfer.files);
                    }
                  }}
                  className="border-2 border-dashed border-brand-border hover:border-brand-green/60 p-5 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-brand-light/20 hover:bg-brand-light/45 transition-colors relative"
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                >
                  <UploadCloud className="w-8 h-8 text-brand-muted" />
                  <span className="text-xs font-bold text-brand-dark">Drag & drop files here or <span className="text-brand-green underline">Browse</span></span>
                  <input 
                    id="file-upload-input"
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files);
                      }
                    }}
                    accept=".jpg,.jpeg,.png,.webp"
                  />
                </div>

                {uploading && <div className="text-xs font-bold text-brand-green animate-pulse">Uploading files...</div>}
                {uploadError && <div className="text-xs font-bold text-red-500">{uploadError}</div>}

                {imagesList.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {imagesList.map((img, idx) => (
                      <div 
                        key={idx}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        className={`relative border rounded-xl overflow-hidden group cursor-move aspect-square ${img.isPrimary ? 'border-brand-green ring-2 ring-brand-green/30' : 'border-brand-border'}`}
                      >
                        <img src={img.url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                        {img.isPrimary && (
                          <span className="absolute top-1 left-1 bg-brand-green text-white text-[8px] font-black px-1 py-0.5 rounded shadow uppercase">Primary</span>
                        )}
                        <div className="absolute inset-0 bg-brand-dark/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => togglePrimaryImage(idx)}
                              className="p-1.5 rounded-lg bg-white/95 text-brand-dark hover:bg-brand-green hover:text-white transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1.5 rounded-lg bg-white/95 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Localized Descriptions */}
              <div className="border border-brand-border/60 p-4 rounded-2xl bg-brand-light/10 space-y-3">
                <span className="text-[10px] font-black text-brand-muted uppercase block">Product Description translations</span>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-dark">English (en) *</label>
                    <textarea
                      value={pmDescEn}
                      onChange={(e) => setPmDescEn(e.target.value)}
                      className="w-full bg-white border rounded-xl p-3 text-xs outline-none font-semibold h-16 resize-none"
                      required
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-dark">Hindi (hi)</label>
                    <textarea
                      value={pmDescHi}
                      onChange={(e) => setPmDescHi(e.target.value)}
                      className="w-full bg-white border rounded-xl p-3 text-xs outline-none font-semibold h-16 resize-none"
                    ></textarea>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-brand-dark">Marathi (mr)</label>
                    <textarea
                      value={pmDescMr}
                      onChange={(e) => setPmDescMr(e.target.value)}
                      className="w-full bg-white border rounded-xl p-3 text-xs outline-none font-semibold h-16 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Specifications List Manager */}
              <div className="border border-brand-border/60 p-4 rounded-2xl bg-brand-light/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-brand-muted uppercase block">Product Specifications</span>
                  <button 
                    type="button" 
                    onClick={addSpecRow}
                    className="text-[9px] bg-brand-green/10 text-brand-green px-2 py-1 rounded-lg border font-bold cursor-pointer hover:bg-brand-green hover:text-white"
                  >
                    + Add Spec
                  </button>
                </div>
                {pmSpecs.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {pmSpecs.map((spec, sIdx) => (
                      <div key={sIdx} className="border border-brand-border/40 p-3 rounded-xl bg-white space-y-2 relative">
                        <button 
                          type="button" 
                          onClick={() => removeSpecRow(sIdx)}
                          className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-full cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                        
                        {/* Key translations */}
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            type="text" 
                            value={spec.key.en} 
                            onChange={(e) => updateSpecKey(sIdx, 'en', e.target.value)}
                            placeholder="Key (en)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                          <input 
                            type="text" 
                            value={spec.key.hi} 
                            onChange={(e) => updateSpecKey(sIdx, 'hi', e.target.value)}
                            placeholder="Key (hi)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                          <input 
                            type="text" 
                            value={spec.key.mr} 
                            onChange={(e) => updateSpecKey(sIdx, 'mr', e.target.value)}
                            placeholder="Key (mr)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                        </div>

                        {/* Value translations */}
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            type="text" 
                            value={spec.value.en} 
                            onChange={(e) => updateSpecValue(sIdx, 'en', e.target.value)}
                            placeholder="Value (en)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                          <input 
                            type="text" 
                            value={spec.value.hi} 
                            onChange={(e) => updateSpecValue(sIdx, 'hi', e.target.value)}
                            placeholder="Value (hi)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                          <input 
                            type="text" 
                            value={spec.value.mr} 
                            onChange={(e) => updateSpecValue(sIdx, 'mr', e.target.value)}
                            placeholder="Value (mr)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features List Manager */}
              <div className="border border-brand-border/60 p-4 rounded-2xl bg-brand-light/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-brand-muted uppercase block">Key Features</span>
                  <button 
                    type="button" 
                    onClick={addFeatureRow}
                    className="text-[9px] bg-brand-green/10 text-brand-green px-2 py-1 rounded-lg border font-bold cursor-pointer hover:bg-brand-green hover:text-white"
                  >
                    + Add Feature
                  </button>
                </div>
                {pmFeatures.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {pmFeatures.map((feat, fIdx) => (
                      <div key={fIdx} className="border border-brand-border/40 p-3 rounded-xl bg-white space-y-2 relative">
                        <button 
                          type="button" 
                          onClick={() => removeFeatureRow(fIdx)}
                          className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-full cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <input 
                            type="text" 
                            value={feat.en} 
                            onChange={(e) => updateFeatureVal(fIdx, 'en', e.target.value)}
                            placeholder="Feature (en)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                          <input 
                            type="text" 
                            value={feat.hi} 
                            onChange={(e) => updateFeatureVal(fIdx, 'hi', e.target.value)}
                            placeholder="Feature (hi)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                          <input 
                            type="text" 
                            value={feat.mr} 
                            onChange={(e) => updateFeatureVal(fIdx, 'mr', e.target.value)}
                            placeholder="Feature (mr)" 
                            className="bg-brand-light border rounded px-2 py-1 text-xs outline-none font-semibold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-brand-light">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="btn-secondary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  {lang === 'hi' ? 'रद्द करें' : lang === 'mr' ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer"
                >
                  {lang === 'hi' ? 'उत्पाद सहेजें' : lang === 'mr' ? 'उत्पादन जतन करा' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
