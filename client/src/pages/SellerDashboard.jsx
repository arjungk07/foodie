import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  LayoutDashboard, Package, PlusCircle, ShoppingBag,
  Pencil, Trash2, X, ImagePlus, ChevronDown, TrendingUp,
  Lock, Plus, Star, Info, Tag
} from 'lucide-react';
import API from '../services/api.js';

// ── Small reusable helpers ─────────────────────────────────────────────────
const Field = ({ label, required, children, helper }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
      <span>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
    </label>
    {children}
    {helper && <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">{helper}</p>}
  </div>
);

const inputCls =
  'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all';

const StatCard = ({ label, value, sub, color }) => (
  <div className={`rounded-2xl border ${color} p-5 flex flex-col gap-1 bg-white dark:bg-slate-900`}>
    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-2xl font-black text-slate-800 dark:text-white">{value ?? '—'}</span>
    {sub && <span className="text-[11px] text-slate-400">{sub}</span>}
  </div>
);

// ── Initial form state ─────────────────────────────────────────────────────
const DEFAULT_SPECS = [
  { key: 'Brand Partner', value: '' },
  { key: 'Logistics Package', value: 'Commercial Safe package' },
  { key: 'Lead Time', value: '2-4 Business Days' },
  { key: 'Warranty', value: '1 Year Manufacturer Warranty' }
];

const EMPTY_FORM = {
  productName: '',
  category: '',
  subCategory: '',
  brand: '',
  productDescription: '',
  price: '',
  platformFee: '0',
  minimumOrderQuantity: '1',
  stock: '',
  unit: 'Piece',
  discount: '0',
};

const UNITS = ['Piece', 'Pack', 'Box', 'Bottle', 'Kg', 'Gram', 'Liter', 'Ml', 'Dozen'];

const SUBCATEGORIES_BY_CATEGORY_NAME = {
  Foods: ['Snacks', 'Drinks', 'Bakery', 'Fast Food', 'Desserts', 'Healthy Foods', 'Breakfast', 'Sweets', 'Chocolates', 'Biscuits', 'Ice Cream', 'Street Food'],
  Vegetables: ['Fresh Vegetables', 'Organic Vegetables', 'Leafy Greens', 'Root Vegetables', 'Exotic Vegetables'],
  Fruits: ['Fresh Fruits', 'Organic Fruits', 'Exotic Fruits', 'Citrus Fruits', 'Berries'],
  Beverages: ['Juices', 'Soft Drinks', 'Tea & Coffee', 'Energy Drinks', 'Water'],
  Snacks: ['Chips', 'Cookies', 'Namkeen', 'Chocolates', 'Cakes', 'Wafers'],
  Bakery: ['Breads', 'Cakes', 'Pastries', 'Biscuits', 'Muffins'],
  Dairy: ['Milk', 'Cheese', 'Butter', 'Yogurt', 'Paneer'],
  Spices: ['Whole Spices', 'Ground Spices', 'Blended Spices', 'Herbs'],
  Rice: ['Basmati Rice', 'Non-Basmati Rice', 'Brown Rice', 'Organic Rice'],
  Pulses: ['Dal', 'Beans', 'Peas', 'Lentils'],
};

const DEFAULT_CATEGORIES = [
  { _id: "vegetables", name: "Vegetables" },
  { _id: "fruits", name: "Fruits" },
  { _id: "grains", name: "Grains & Cereals" },
  { _id: "rice", name: "Rice" },
  { _id: "pulses", name: "Pulses" },
  { _id: "spices", name: "Spices" },
  { _id: "oil", name: "Cooking Oil" },
  { _id: "dairy", name: "Dairy Products" },
  { _id: "meat", name: "Meat & Poultry" },
  { _id: "seafood", name: "Seafood" },
  { _id: "bakery", name: "Bakery" },
  { _id: "beverages", name: "Beverages" },
  { _id: "snacks", name: "Snacks" },
  { _id: "organic", name: "Organic Products" },
  { _id: "others", name: "Others" },
];

// ── Main component ─────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  // Active panel: overview | products | add-product | orders
  const [panel, setPanel] = useState('overview');

  // Server data
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);

  // Loading flags
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Add / Edit form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [specifications, setSpecifications] = useState(DEFAULT_SPECS);
  const [imageFiles, setImageFiles] = useState([]);        // File objects
  const [imagePreviews, setImagePreviews] = useState([]);   // Preview URL strings
  const [removedImageIds, setRemovedImageIds] = useState([]); // Cloudinary publicIds to remove when updating
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // ── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'seller' && user?.role !== 'admin') {
      toast.error('Access denied. Seller account required.');
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // ── Initial data fetch ───────────────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchProducts();
    fetchCategories();
    fetchOrders();
  }, []);

  // Polling for orders in seller dashboard
  useEffect(() => {
    if (panel !== 'orders') return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [panel]);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/seller/stats');
      setStats(data.stats);
    } catch (e) { console.error(e); }
    finally { setLoadingStats(false); }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await API.get('/seller/products');
      setProducts(data.products || []);
    } catch (e) { console.error(e); }
    finally { setLoadingProducts(false); }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/products/categories");

      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      } else {
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (err) {
      console.log(err);
      setCategories(DEFAULT_CATEGORIES);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await API.get('/seller/orders');
      setOrders(data.orders || []);
    } catch (e) { console.error(e); }
    finally { setLoadingOrders(false); }
  };

  // ── Tag Handlers ────────────────────────────────────────────────────────
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().toLowerCase().replace(/^,|,$/g, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, idx) => idx !== indexToRemove));
  };

  // ── Specification Handlers ──────────────────────────────────────────────
  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const updateSpecification = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, idx) => idx !== index));
  };

  // ── Image picker & Validation ───────────────────────────────────────────
  const handleImagePick = (e) => {
    const picked = Array.from(e.target.files);
    const totalCount = imagePreviews.length;
    const remaining = 5 - totalCount;

    if (remaining <= 0) {
      toast.warning('Maximum 5 images allowed');
      return;
    }

    const allowed = [];
    for (const file of picked) {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(`Invalid file type for ${file.name}. Only JPG, JPEG, PNG, WEBP allowed.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 5MB limit.`);
        continue;
      }
      allowed.push(file);
      if (allowed.length === remaining) break;
    }

    if (allowed.length === 0) return;

    setImageFiles((prev) => [...prev, ...allowed]);
    allowed.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx) => {
    const previewToRemove = imagePreviews[idx];
    if (editId && typeof previewToRemove === 'string' && previewToRemove.startsWith('http')) {
      const foundProduct = products.find(p => p._id === editId);
      const matchedImg = foundProduct?.images?.find(img => img.url === previewToRemove);
      if (matchedImg && matchedImg.publicId) {
        setRemovedImageIds(prev => [...prev, matchedImg.publicId]);
      }
    }
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Form helpers ─────────────────────────────────────────────────────────
  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setTags([]);
    setTagInput('');
    setSpecifications(DEFAULT_SPECS);
    setImageFiles([]);
    setImagePreviews([]);
    setRemovedImageIds([]);
    setEditId(null);
  };

  // ── Edit click ───────────────────────────────────────────────────────────
  const handleEdit = (product) => {
    setEditId(product._id);
    const catId = product.category?._id || product.category || '';
    setForm({
      productName: product.productName || '',
      category: catId,
      subCategory: product.subCategory || '',
      brand: product.brand || '',
      productDescription: product.productDescription || '',
      price: product.price !== undefined ? String(product.price) : '',
      platformFee: product.platformFee !== undefined ? String(product.platformFee) : '0',
      minimumOrderQuantity: product.minimumOrderQuantity ? String(product.minimumOrderQuantity) : '1',
      stock: product.stock !== undefined ? String(product.stock) : '',
      unit: product.unit || 'Piece',
      discount: product.discount !== undefined ? String(product.discount) : '0',
    });

    if (Array.isArray(product.tags)) {
      setTags(product.tags);
    } else if (typeof product.tags === 'string') {
      setTags(product.tags.split(',').map(t => t.trim()).filter(Boolean));
    } else {
      setTags([]);
    }

    if (Array.isArray(product.specifications) && product.specifications.length > 0) {
      setSpecifications(product.specifications.map(s => ({ key: s.key || '', value: s.value || '' })));
    } else {
      setSpecifications(DEFAULT_SPECS);
    }

    setImageFiles([]);
    setImagePreviews(product.images?.map((i) => i.url) || []);
    setRemovedImageIds([]);
    setPanel('add-product');
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success('Product deleted');
      setProducts((prev) => prev.filter((p) => p._id !== id));
      fetchStats();
    } catch { toast.error('Failed to delete product'); }
  };

  // ── Submit form ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.productName.trim()) { toast.warning('Product Name is required'); return; }
    if (!form.category) { toast.warning('Please select a Category'); return; }
    if (!form.subCategory.trim()) { toast.warning('Subcategory is required'); return; }
    if (!form.brand.trim()) { toast.warning('Brand is required'); return; }
    if (!form.productDescription.trim()) { toast.warning('Product Description is required'); return; }
    if (!form.price || Number(form.price) <= 0) { toast.warning('Selling Price must be greater than 0'); return; }
    if (form.stock === '' || Number(form.stock) < 0) { toast.warning('Stock Quantity cannot be negative'); return; }
    if (!form.minimumOrderQuantity || Number(form.minimumOrderQuantity) < 1) { toast.warning('Minimum Order Quantity (MOQ) must be at least 1'); return; }
    if (Number(form.stock) > 0 && Number(form.minimumOrderQuantity) > Number(form.stock)) {
      toast.warning('MOQ cannot be greater than available Stock Quantity');
      return;
    }
    if (imagePreviews.length === 0) { toast.warning('At least 1 product image is required'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('productName', form.productName.trim());
      fd.append('category', form.category);
      fd.append('subCategory', form.subCategory.trim());
      fd.append('brand', form.brand.trim());
      fd.append('productDescription', form.productDescription.trim());
      fd.append('price', form.price);
      fd.append('platformFee', form.platformFee || '0');
      fd.append('stock', form.stock);
      fd.append('minimumOrderQuantity', form.minimumOrderQuantity || '1');
      fd.append('unit', form.unit || 'Piece');
      fd.append('discount', form.discount || '0');
      fd.append('tags', JSON.stringify(tags));

      const validSpecs = specifications.filter(s => s.key.trim() && s.value.trim());
      fd.append('specifications', JSON.stringify(validSpecs));

      if (editId && removedImageIds.length > 0) {
        fd.append('removeImages', JSON.stringify(removedImageIds));
      }

      imageFiles.forEach((file) => fd.append('images', file));

      if (editId) {
        await API.put(`/products/${editId}`, fd);
        toast.success('Product updated successfully!');
      } else {
        await API.post('/products', fd);
        toast.success('Product added to inventory!');
      }

      resetForm();
      setPanel('products');
      fetchProducts();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Order status update ──────────────────────────────────────────────────
  const handleOrderStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      if (status === 'Out For Delivery') {
        toast.success('Order status updated to Out For Delivery. OTP generated & sent to customer!');
      } else {
        toast.success(`Order status → ${status}`);
      }
      fetchOrders();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  // ── Sidebar nav items ────────────────────────────────────────────────────
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  // Computed stats for overview
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">

      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100 dark:border-slate-800">
          <span className="text-sm font-black text-emerald-600">Seller Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                if (id !== panel) { resetForm(); }
                setPanel(id);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer ${panel === id
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Seller info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{user?.fullName}</p>
          <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
        </div>
      </aside>

      {/* ─── Mobile top bar ──────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-99 h-20 md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { if (id !== panel) resetForm(); setPanel(id); }}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 text-[10px] font-medium transition-colors cursor-pointer ${panel === id ? 'text-emerald-600' : 'text-slate-400'
              }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="w-full flex flex-col min-h-screen pb-20 md:pb-0">

        {/* Top bar */}
        <header className="h-16 shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 gap-3">
          <h1 className="text-sm font-bold text-slate-800 dark:text-white flex-1">
            {navItems.find((n) => n.id === panel)?.label}
          </h1>
          {panel !== 'add-product' && (
            <button
              onClick={() => { resetForm(); setPanel('add-product'); }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Add Product
            </button>
          )}
        </header>

        <div className="flex-1 p-5 md:p-7 overflow-auto">

          {/* ═══════════════ OVERVIEW ═════════════════════════════════════ */}
          {panel === 'overview' && (
            <div className="flex flex-col gap-6">

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Products"
                  value={loadingStats ? '...' : (stats?.totalProducts ?? products.length)}
                  color="border-slate-200 dark:border-slate-700"
                />
                <StatCard
                  label="Total Orders"
                  value={loadingStats ? '...' : (stats?.totalOrders ?? orders.length)}
                  color="border-blue-100 dark:border-blue-900/30"
                />
                <StatCard
                  label="Total Sales"
                  value={loadingStats ? '...' : (stats?.totalRevenue ? `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}` : '₹0')}
                  color="border-emerald-100 dark:border-emerald-900/30"
                />
                <StatCard
                  label="Low Stock"
                  value={loadingStats ? '...' : lowStockCount}
                  sub="Products below 10 units"
                  color="border-amber-100 dark:border-amber-900/30"
                />
              </div>

              {/* Recent products preview */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Recent Products</h2>
                  <button onClick={() => setPanel('products')} className="text-xs text-emerald-600 font-semibold hover:underline cursor-pointer">View All</button>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                  {products.slice(0, 5).map((p) => (
                    <div key={p._id} className="flex items-center gap-3 px-5 py-3">
                      <img
                        src={p.images?.[0]?.url || 'https://placehold.co/40x40?text=?'}
                        alt={p.productName}
                        className="h-10 w-10 rounded-lg object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{p.productName}</p>
                        <p className="text-[11px] text-slate-400">₹{p.price} · Stock: {p.stock}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                        }`}>
                        {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-xs text-slate-400 px-5 py-6 text-center">No products added yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ MY PRODUCTS ══════════════════════════════════ */}
          {panel === 'products' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Product Inventory</h2>
                <p className="text-xs text-slate-400 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
              </div>

              {loadingProducts ? (
                <div className="py-16 text-center text-xs text-slate-400">Loading inventory...</div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-slate-400 mb-3">No products added yet</p>
                  <button onClick={() => setPanel('add-product')} className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer">
                    Add First Product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        {['Image', 'Product Name', 'Category', 'Price', 'Platform Fee', 'Stock', 'Status', 'Actions'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <img
                              src={p.images?.[0]?.url || 'https://placehold.co/40x40?text=?'}
                              alt={p.productName}
                              className="h-10 w-10 rounded-lg object-cover border border-slate-100 dark:border-slate-800"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-45 truncate">{p.productName}</p>
                            {p.brand && <p className="text-[11px] text-slate-400">{p.brand}</p>}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {p.category?.name || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            ₹{p.price}
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-450 whitespace-nowrap">
                            ₹{p.platformFee ?? 0}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                            {p.stock}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${p.stock > 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                              }`}>
                              {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(p)}
                                className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 transition-colors cursor-pointer"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(p._id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════ ADD / EDIT PRODUCT ══════════════════════════ */}
          {panel === 'add-product' && (
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex flex-col gap-6">

              {/* Page heading */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {editId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {editId ? 'Update the product details below.' : 'Fill in the required details to list a wholesale/retail product.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { resetForm(); setPanel('products'); }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Back to Inventory
                </button>
              </div>

              {/* ── SECTION 1: BASIC INFORMATION ── */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5">
                  SECTION 1 — BASIC INFORMATION
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Product Name" required>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g. Lay's Classic Salted Potato Chips (150g)"
                      value={form.productName}
                      onChange={setField('productName')}
                      required
                    />
                  </Field>

                  <Field label="Category" required>
                    <div className="relative">
                      <select
                        className={`${inputCls} appearance-none pr-8`}
                        value={form.category}
                        onChange={(e) => {
                          const selectedCatId = e.target.value;
                          const catObj = categories.find(c => c._id === selectedCatId);
                          const catName = catObj?.name || '';
                          const subOpts = SUBCATEGORIES_BY_CATEGORY_NAME[catName] || [];
                          setForm(prev => ({
                            ...prev,
                            category: selectedCatId,
                            subCategory: subOpts[0] || prev.subCategory || ''
                          }));
                        }}
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </Field>

                  <Field label="Subcategory" required>
                    {(() => {
                      const activeCat = categories.find(c => c._id === form.category);
                      const suggestions = SUBCATEGORIES_BY_CATEGORY_NAME[activeCat?.name] || ['Snacks', 'Drinks', 'Bakery', 'General'];
                      return (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            className={inputCls}
                            placeholder="e.g. Snacks, Beverages"
                            value={form.subCategory}
                            onChange={setField('subCategory')}
                            list="subcategory-suggestions"
                            required
                          />
                          <datalist id="subcategory-suggestions">
                            {suggestions.map((sub) => (
                              <option key={sub} value={sub} />
                            ))}
                          </datalist>
                        </div>
                      );
                    })()}
                  </Field>

                  <Field label="Brand" required>
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="e.g. Lay's, Amul, Tata"
                      value={form.brand}
                      onChange={setField('brand')}
                      required
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Tags" helper="Type a tag and press Enter or comma to add chips (e.g. foods, snacks, lays, bulk, wholesale)">
                      <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-emerald-500">
                        {tags.map((t, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <Tag className="h-3 w-3" />
                            {t}
                            <button
                              type="button"
                              onClick={() => removeTag(idx)}
                              className="text-emerald-500 hover:text-emerald-800 dark:hover:text-white"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          className="flex-1 min-w-30 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none"
                          placeholder={tags.length === 0 ? "e.g. foods, snacks, lays, bulk, wholesale" : "Add more tags..."}
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </section>

              {/* ── SECTION 2: PRODUCT DESCRIPTION ── */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    SECTION 2 — PRODUCT DESCRIPTION <span className="text-red-500">*</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {form.productDescription.length} / 2000
                  </span>
                </div>
                <Field label="Product Description" required helper="Describe product quality, packaging, ingredients, details, usage, shelf life, and sourcing info.">
                  <textarea
                    rows={5}
                    maxLength={2000}
                    className={`${inputCls} resize-none`}
                    placeholder="Provide details on product quality, commercial safe packaging, ingredients, shelf life, and B2B wholesale sourcing..."
                    value={form.productDescription}
                    onChange={setField('productDescription')}
                    required
                  />
                </Field>
              </section>

              {/* ── SECTION 3: PRICING & DISCOUNT ── */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5">
                  SECTION 3 — PRICING &amp; DISCOUNT
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Selling Price (₹)" required helper="Price per unit in INR">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={inputCls}
                      placeholder="e.g. 5.00"
                      value={form.price}
                      onChange={setField('price')}
                      required
                    />
                  </Field>

                  <Field label="Discount (%)" helper="Optional percentage discount (0 to 100)">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className={inputCls}
                      placeholder="0"
                      value={form.discount}
                      onChange={setField('discount')}
                    />
                  </Field>

                  <Field label="Platform Fee (₹)" helper="System configured fee per product">
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        readOnly
                        className={`${inputCls} bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 cursor-not-allowed pr-8`}
                        value={form.platformFee || '0'}
                      />
                      <Lock className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </Field>
                </div>
              </section>

              {/* ── SECTION 4: INVENTORY & ORDERING ── */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-5">
                  SECTION 4 — INVENTORY &amp; ORDERING
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field label="Stock Quantity" required helper="Total available stock in inventory">
                    <input
                      type="number"
                      min="0"
                      className={inputCls}
                      placeholder="e.g. 515"
                      value={form.stock}
                      onChange={setField('stock')}
                      required
                    />
                  </Field>

                  <Field label="Unit" required helper="Packaging measurement unit">
                    <div className="relative">
                      <select
                        className={`${inputCls} appearance-none pr-8`}
                        value={form.unit}
                        onChange={setField('unit')}
                        required
                      >
                        {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </Field>

                  <Field label="Minimum Order Quantity (MOQ)" required helper="Minimum quantity a customer must order.">
                    <input
                      type="number"
                      min="1"
                      className={inputCls}
                      placeholder="e.g. 1"
                      value={form.minimumOrderQuantity}
                      onChange={setField('minimumOrderQuantity')}
                      required
                    />
                  </Field>
                </div>

                <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Minimum order quantity is {form.minimumOrderQuantity || '1'} {form.unit || 'Piece'}(s). Please ensure <strong>your stock is at least {form.minimumOrderQuantity || '1'} {form.unit || 'Piece'}(s) </strong> to meet the required MOQ.                  </p>
                </div>
              </section>

              {/* ── SECTION 5: PRODUCT IMAGES ── */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    SECTION 5 — PRODUCT IMAGES <span className="text-red-500">*</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {imagePreviews.length} / 5 selected
                  </span>
                </div>

                {/* Previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src}
                          alt={`preview-${idx}`}
                          className="h-24 w-24 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                        {idx === 0 && (
                          <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                            <Star className="h-2.5 w-2.5 fill-white" /> Primary
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-transform transform hover:scale-110 cursor-pointer"
                          title="Remove image"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload zone */}
                {imagePreviews.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-8 gap-2 hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 transition-colors cursor-pointer"
                  >
                    <ImagePlus className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Click to upload product images</p>
                    <p className="text-[11px] text-slate-400">JPG, JPEG, PNG, WEBP up to 5MB each · Maximum 5 images</p>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImagePick}
                />
              </section>

              {/* ── SECTION 6: PRODUCT SPECIFICATIONS ── */}
              <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    SECTION 6 — PRODUCT SPECIFICATIONS
                  </h3>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Specification
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {specifications.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        className={`${inputCls} flex-1`}
                        placeholder="Specification Key (e.g. Lead Time)"
                        value={spec.key}
                        onChange={(e) => updateSpecification(idx, 'key', e.target.value)}
                      />
                      <input
                        type="text"
                        className={`${inputCls} flex-1`}
                        placeholder="Specification Value (e.g. 2-4 Business Days)"
                        value={spec.value}
                        onChange={(e) => updateSpecification(idx, 'value', e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(idx)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        title="Remove specification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {specifications.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-3">
                      No specifications added yet. Click "+ Add Specification" to include warranty, lead time, or logistics info.
                    </p>
                  )}
                </div>
              </section>

              {/* ── SECTION 7: ACTIONS ── */}
              <div className="flex items-center justify-end gap-3 pb-8">
                <button
                  type="button"
                  onClick={() => { resetForm(); setPanel('products'); }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{editId ? 'Updating Product...' : 'Saving Product...'}</span>
                    </>
                  ) : (
                    <span>{editId ? 'Update Product' : 'Save Product'}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ═══════════════ ORDERS ═══════════════════════════════════════ */}
          {panel === 'orders' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">Customer Orders</h2>
                <p className="text-xs text-slate-400 mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} received</p>
              </div>

              {loadingOrders ? (
                <div className="py-16 text-center text-xs text-slate-400">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400">No orders received yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                        {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                          <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {orders.map((o) => (
                        <tr key={o._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-3 text-[11px] font-mono text-slate-500">{o.invoiceNumber || o._id.slice(-8)}</td>
                          <td className="px-4 py-3 text-xs text-slate-700 dark:text-slate-300">
                            {o.userId?.fullName || '—'}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex flex-col gap-1.5 min-w-45">
                              {o.items?.map((item, idx) => {
                                return (
                                  <div key={idx} className="text-[11px] leading-tight border-b border-slate-100 dark:border-slate-800/60 pb-1 last:border-0">
                                    <p className="pt-1 font-bold text-slate-800 dark:text-slate-200">{item.productName || item.productId?.productName}</p>
                                    <p className="pt-1 text-slate-500">Price: ₹{item.price} | Qty: {item.quantity}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            ₹{o.totalAmount?.toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                              : o.status === 'Shipped' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
                                : o.status === 'Out For Delivery' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
                                  : o.status === 'Packed' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
                                    : o.status === 'Confirmed' ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-450'
                                      : o.status === 'Cancelled' ? 'bg-red-50 text-red-650 dark:bg-red-950/30 dark:text-red-400'
                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                              }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            {o.status === 'Delivered' ? (
                              <div className="flex flex-col text-[10px] text-slate-500 leading-tight">
                                <span className="font-bold text-emerald-600 whitespace-nowrap flex items-center gap-0.5">
                                  ✓ Delivery Completed
                                </span>
                                <span className="font-semibold text-slate-400">Verified by OTP</span>
                                {o.deliveredAt && (
                                  <>
                                    <span>Date: {new Date(o.deliveredAt).toLocaleDateString('en-IN')}</span>
                                    <span>Time: {new Date(o.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </>
                                )}
                              </div>
                            ) : o.status === 'Cancelled' ? (
                              <span className="text-[11px] font-bold text-red-505">Order Cancelled</span>
                            ) : (
                              <select
                                value={o.status}
                                onChange={(e) => handleOrderStatus(o._id, e.target.value)}
                                className="text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 font-semibold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Packed">Packed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out For Delivery">Out For Delivery</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
