import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  Shield, Users, Folders, Package, Tag, MessageSquare, Megaphone, 
  Trash2, PlusCircle, Check, X, ShieldAlert, Award, Calendar, ToggleLeft, ToggleRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../services/api.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Active tab: overview, users, categories, coupons, reviews, broadcast
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Categories State
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percentage', discountValue: '', minPurchase: 0, expiryDate: '', active: true
  });

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Broadcast Alert Form
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('system');
  const [broadcasting, setBroadcasting] = useState(false);

  // Verify Admin Role
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Administrator credentials required.');
      navigate('/products');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    loadStats();
    loadUsers();
    loadCategories();
    loadCoupons();
    loadReviews();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await API.get('/admin/stats');
      setStats(data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await API.get('/admin/users');
      setUsersList(data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const { data } = await API.get('/products/categories');
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCoupons = async () => {
    try {
      const { data } = await API.get('/admin/coupons');
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReviews = async () => {
    try {
      const { data } = await API.get('/seller/reviews'); // Seller endpoint lists reviews cleanly
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role modified!');
      loadUsers();
      loadStats();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      toast.info('User deleted');
      setUsersList(prev => prev.filter(u => u._id !== userId));
      loadStats();
    } catch (err) {
      toast.error('Delete user failed');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    try {
      await API.post('/admin/categories', { name: catName, description: catDesc, image: catImage });
      toast.success('Category created successfully!');
      setCatName('');
      setCatDesc('');
      setCatImage('');
      loadCategories();
    } catch (err) {
      toast.error('Create category failed');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await API.delete(`/admin/categories/${id}`);
      toast.info('Category deleted');
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      toast.error('Delete category failed');
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountValue || !couponForm.expiryDate) {
      toast.warning('Please complete all coupon fields');
      return;
    }
    try {
      await API.post('/admin/coupons', couponForm);
      toast.success('Coupon created successfully!');
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minPurchase: 0, expiryDate: '', active: true });
      loadCoupons();
    } catch (err) {
      toast.error('Create coupon failed');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await API.delete(`/admin/coupons/${id}`);
      toast.info('Coupon deleted');
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      toast.error('Delete coupon failed');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Moderate/delete this review?')) return;
    try {
      await API.delete(`/admin/reviews/${id}`);
      toast.info('Review deleted');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      toast.error('Moderate review failed');
    }
  };

  const handleBroadcastAlert = async (e) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;

    setBroadcasting(true);
    try {
      await API.post('/admin/notifications/broadcast', { title: alertTitle, message: alertMessage, type: alertType });
      toast.success('Announcement broadcasted successfully to all platform accounts!');
      setAlertTitle('');
      setAlertMessage('');
    } catch (err) {
      toast.error('Announcement failed');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 border-r border-slate-200 bg-white dark:border-slate-850 dark:bg-dark-card transition-colors duration-200 flex-shrink-0">
        <div className="p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Console</h2>
            <p className="text-[10px] text-slate-550 font-medium truncate mt-0.5">{user?.fullName}</p>
          </div>
          
          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left cursor-pointer ${activeTab === 'overview' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450 border-l-4 border-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Shield className="h-4.5 w-4.5" />
              Platform Stats
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left cursor-pointer ${activeTab === 'users' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450 border-l-4 border-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Users className="h-4.5 w-4.5" />
              Users & Sellers
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left cursor-pointer ${activeTab === 'categories' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450 border-l-4 border-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Folders className="h-4.5 w-4.5" />
              Manage Categories
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left cursor-pointer ${activeTab === 'coupons' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450 border-l-4 border-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Tag className="h-4.5 w-4.5" />
              Manage Coupons
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left cursor-pointer ${activeTab === 'reviews' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450 border-l-4 border-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <MessageSquare className="h-4.5 w-4.5" />
              Reviews Moderation
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-left cursor-pointer ${activeTab === 'broadcast' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450 border-l-4 border-emerald-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <Megaphone className="h-4.5 w-4.5" />
              Broadcast Alert
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 sm:p-8 bg-slate-50/50 dark:bg-dark-bg/20 min-h-screen transition-colors">
        
        {/* TAB 1: Platform Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white">Admin Management Analytics</h1>
            
            {/* Widget grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850">
                <p className="text-[10px] text-slate-450 uppercase font-semibold">Total Revenue</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500 mt-1">
                  ${statsLoading ? '...' : stats?.totalRevenue?.toFixed(2)}
                </p>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850">
                <p className="text-[10px] text-slate-450 uppercase font-semibold">Registered Buyers</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {statsLoading ? '...' : stats?.totalUsers}
                </p>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850">
                <p className="text-[10px] text-slate-450 uppercase font-semibold">Verified Sellers</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {statsLoading ? '...' : stats?.totalSellers}
                </p>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850">
                <p className="text-[10px] text-slate-450 uppercase font-semibold">Total Catalog items</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {statsLoading ? '...' : stats?.totalProducts}
                </p>
              </div>
            </div>

            {/* Sales Chart using Recharts Area */}
            <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-sm">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span>Global Platform Sourcing Sales Curve</span>
              </h2>

              {!statsLoading && stats?.monthlySales ? (
                <div className="h-72 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlySales}>
                      <defs>
                        <linearGradient id="colorSalesAdmin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSalesAdmin)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-455 text-center py-20 animate-pulse">Computing Data Maps...</p>
              )}
            </div>

            {/* Warning tables grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Orders table */}
              <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
                <h3 className="text-xs font-bold text-slate-450 uppercase mb-4">Recent Sourcing Orders</h3>
                <div className="flex flex-col gap-3">
                  {statsLoading ? (
                    <p className="text-xs text-slate-400">Loading orders...</p>
                  ) : stats?.recentOrders?.length === 0 ? (
                    <p className="text-xs text-slate-400">No orders placed yet.</p>
                  ) : (
                    stats?.recentOrders?.map(order => (
                      <div key={order._id} className="flex justify-between items-center text-xs border-b border-slate-50 dark:border-slate-900 pb-2">
                        <div>
                          <p className="font-bold">{order.invoiceNumber}</p>
                          <p className="text-[10px] text-slate-400">Buyer: {order.userId?.fullName} | Status: {order.status}</p>
                        </div>
                        <span className="font-bold text-emerald-600">${order.totalAmount.toFixed(2)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Low Stock Warns */}
              <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-5 rounded-2xl shadow-sm">
                <h3 className="text-xs font-bold text-slate-455 uppercase mb-4 text-red-500 flex items-center gap-1">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Low Stock Inventory Alerts</span>
                </h3>
                <div className="flex flex-col gap-3">
                  {statsLoading ? (
                    <p className="text-xs text-slate-400">Loading alerts...</p>
                  ) : stats?.lowStockAlerts?.length === 0 ? (
                    <p className="text-xs text-slate-400">All warehouse stock is stable.</p>
                  ) : (
                    stats?.lowStockAlerts?.map(prod => (
                      <div key={prod._id} className="flex justify-between items-center text-xs border-b border-slate-50 dark:border-slate-900 pb-2">
                        <div>
                          <p className="font-bold truncate max-w-[180px]">{prod.productName}</p>
                          <p className="text-[10px] text-slate-400">Distributor: {prod.sellerId?.fullName}</p>
                        </div>
                        <span className="font-bold text-red-500">{prod.stock} left</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: Users & Sellers list */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Registered Accounts Management
            </h1>

            {usersLoading ? (
              <p className="text-xs text-slate-400">Loading user list...</p>
            ) : (
              <div className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-dark-bg/60 border-b border-slate-100 dark:border-slate-800 font-bold text-slate-450 uppercase tracking-wider text-[10px]">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Mobile</th>
                        <th className="p-4">Role Role</th>
                        <th className="p-4 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((usr) => (
                        <tr key={usr._id} className="border-b border-slate-50 dark:border-slate-900">
                          <td className="p-4 font-bold">{usr.fullName}</td>
                          <td className="p-4 font-mono text-slate-500">{usr.email}</td>
                          <td className="p-4">{usr.mobile}</td>
                          <td className="p-4">
                            <select
                              value={usr.role}
                              onChange={(e) => handleUpdateUserRole(usr._id, e.target.value)}
                              className="py-1 px-2 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                            >
                              <option value="customer">customer</option>
                              <option value="seller">seller</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              disabled={usr._id === user._id}
                              onClick={() => handleDeleteUser(usr._id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Categories CRUD */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Create Category form */}
            <div className="lg:col-span-1">
              <form onSubmit={handleCreateCategory} className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Create Business Category</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Category Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dairy & Frozen"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Description</label>
                  <textarea
                    placeholder="Brief description..."
                    rows="3"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={catImage}
                    onChange={(e) => setCatImage(e.target.value)}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer mt-1"
                >
                  Create Category
                </button>
              </form>
            </div>

            {/* Categories list */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Existing Categories</h3>
              <div className="flex flex-col gap-3">
                {categories.map((cat) => (
                  <div key={cat._id} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-dark-bg/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-850/50">
                    <div className="flex items-center gap-3">
                      {cat.image && <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded-lg object-cover" />}
                      <div>
                        <p className="font-bold text-slate-850 dark:text-slate-200">{cat.name}</p>
                        <p className="text-[10px] text-slate-500 truncate max-w-[300px] mt-0.5">{cat.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: Coupons CRUD */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Create Coupon form */}
            <div className="lg:col-span-1">
              <form onSubmit={handleCreateCoupon} className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Generate Promo Coupon</h3>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-455 uppercase">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EASTER10"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase">Discount Type</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm(p => ({ ...p, discountType: e.target.value }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                    >
                      <option value="percentage">percentage (%)</option>
                      <option value="flat">flat ($)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase">Discount Value</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15"
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm(p => ({ ...p, discountValue: Number(e.target.value) }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase">Min Purchase ($)</label>
                    <input
                      type="number"
                      value={couponForm.minPurchase}
                      onChange={(e) => setCouponForm(p => ({ ...p, minPurchase: Number(e.target.value) }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-455 uppercase">Expiry Date</label>
                    <input
                      type="date"
                      required
                      value={couponForm.expiryDate}
                      onChange={(e) => setCouponForm(p => ({ ...p, expiryDate: e.target.value }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer mt-1"
                >
                  Publish Coupon
                </button>
              </form>
            </div>

            {/* Coupons list */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">Active Promo Coupons</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coupons.map((coupon) => (
                  <div 
                    key={coupon._id} 
                    className="p-4 bg-slate-50 dark:bg-dark-bg/40 border border-slate-200/60 dark:border-slate-850/50 rounded-2xl flex justify-between items-center text-xs"
                  >
                    <div>
                      <p className="font-bold flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{coupon.code}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Discount: {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: Reviews Moderation */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-xl font-extrabold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">
              Customer Comments Thread Moderation
            </h1>

            {reviewsLoading ? (
              <p className="text-xs text-slate-450">Loading comments...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-400">No reviews placed on platform products yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((rev) => (
                  <div 
                    key={rev._id} 
                    className="p-4 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 rounded-2xl shadow-sm flex justify-between items-start gap-4"
                  >
                    <div className="text-xs flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{rev.userId?.fullName}</span>
                        <span className="text-[10px] text-slate-400">on {rev.productId?.productName}</span>
                      </div>
                      <p className="text-slate-500 italic">" {rev.comment} "</p>
                      <span className="text-[9px] text-emerald-600 font-bold">{rev.rating}★ Rating</span>
                    </div>

                    <button
                      onClick={() => handleDeleteReview(rev._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: Broadcast Alert */}
        {activeTab === 'broadcast' && (
          <div className="max-w-xl">
            <form onSubmit={handleBroadcastAlert} className="bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                <Megaphone className="h-4.5 w-4.5 text-emerald-500 animate-bounce" />
                <span>Dispatch Platform Announcements</span>
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Platform Scheduled Maintenance"
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Broadcast Message</label>
                <textarea
                  required
                  placeholder="e.g. Sourcing services will be offline on Sunday 2 AM to 4 AM EST for database optimizations."
                  rows="4"
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 w-48">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Notification Type</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="py-2 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                >
                  <option value="system">system</option>
                  <option value="promotion">promotion</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white w-max transition-colors mt-2 cursor-pointer"
              >
                {broadcasting ? 'Broadcasting Alert...' : 'Broadcast Announcement'}
              </button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}
