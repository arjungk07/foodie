import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, clearErrors } from '../redux/slices/authSlice.js';
import { toast } from 'react-toastify';
import { User, MapPin, ClipboardList, ShieldAlert, KeyRound, Plus, Trash2, CreditCard, ExternalLink } from 'lucide-react';
import API from '../services/api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import { formatINR } from '../utils/currency.js';

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isAuthenticated, loading, successMessage, error } = useSelector((state) => state.auth);

  // Active sub-navigation tab
  const [activeTab, setActiveTab] = useState('details'); // details, addresses, orders

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');

  // Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressPayload, setAddressPayload] = useState({
    fullName: '', addressLine: '', city: '', state: '', postalCode: '', country: 'USA', mobile: '', isDefault: false
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setFullName(user.fullName);
      setMobile(user.mobile);
    }
    loadAddresses();
    loadOrders();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearErrors());
    }
  }, [error, successMessage, dispatch]);

  const loadAddresses = async () => {
    try {
      const { data } = await API.get('/users/addresses');
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const { data } = await API.get('/orders/my-orders');
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfile({ fullName, mobile }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.warning('Please enter current and new passwords');
      return;
    }
    setPwdLoading(true);
    try {
      await API.put('/users/change-password', { oldPassword, newPassword });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/users/addresses', addressPayload);
      toast.success('Address saved!');
      setAddresses(prev => [...prev, data.address]);
      setShowAddressForm(false);
      setAddressPayload({ fullName: '', addressLine: '', city: '', state: '', postalCode: '', country: 'USA', mobile: '', isDefault: false });
    } catch (err) {
      toast.error('Add address failed');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this shipping address?')) return;
    try {
      await API.delete(`/users/addresses/${id}`);
      toast.info('Address deleted');
      setAddresses(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      toast.error('Delete address failed');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      
      <Breadcrumbs paths={[{ label: 'My Account' }]} />

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        
        {/* Left Column - Navigation Cards */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
          
          {/* User Profile summary */}
          <div className="glass-panel p-6 rounded-2xl text-center border border-slate-200/80 dark:border-slate-850">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400 overflow-hidden mb-3">
              <User className="h-8 w-8" />
            </div>
            <h2 className="text-sm font-bold truncate">{user?.fullName}</h2>
            <p className="text-[10px] text-slate-450 truncate mt-0.5">{user?.email}</p>
            <span className="inline-block mt-3 px-3 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-bold uppercase dark:bg-slate-800 dark:text-slate-450 tracking-wider">
              Role: {user?.role}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="glass-panel p-2 rounded-2xl border border-slate-200/80 dark:border-slate-850 flex flex-col gap-1 text-xs">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-left font-semibold cursor-pointer ${activeTab === 'details' ? 'bg-emerald-55/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <User className="h-4.5 w-4.5" />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-left font-semibold cursor-pointer ${activeTab === 'addresses' ? 'bg-emerald-55/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <MapPin className="h-4.5 w-4.5" />
              Shipping Addresses
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-left font-semibold cursor-pointer ${activeTab === 'orders' ? 'bg-emerald-55/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <ClipboardList className="h-4.5 w-4.5" />
              Order Sourcing Logs
            </button>
          </div>

        </aside>

        {/* Right Column - Work Panes */}
        <main className="flex-1 bg-white dark:bg-dark-card border border-slate-200/80 dark:border-slate-850 p-6 sm:p-8 rounded-3xl transition-colors min-h-[50vh]">
          
          {/* Tab 1: Profile Details */}
          {activeTab === 'details' && (
            <div className="flex flex-col gap-8">
              
              {/* Profile Details Edit Form */}
              <form onSubmit={handleProfileUpdate} className="flex flex-col gap-4">
                <h3 className="text-sm font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                  <User className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Update Account Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Registered Email (Read Only)</label>
                    <input
                      type="text"
                      disabled
                      value={user?.email || ''}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:border-slate-850 cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Account Role (Read Only)</label>
                    <input
                      type="text"
                      disabled
                      value={user?.role || 'customer'}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-slate-50 dark:border-slate-850 cursor-not-allowed capitalize"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Contact Mobile</label>
                    <input
                      type="text"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white w-max transition-colors mt-2 cursor-pointer"
                >
                  {loading ? 'Saving changes...' : 'Save Profile Details'}
                </button>
              </form>

              {/* Password Change Form */}
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
                <h3 className="text-sm font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-2">
                  <KeyRound className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Update Password Credentials</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Current Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white w-max transition-colors mt-2 cursor-pointer"
                >
                  {pwdLoading ? 'Modifying password...' : 'Modify Password'}
                </button>
              </form>

            </div>
          )}

          {/* Tab 2: Addresses list & CRUD */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-6">
              
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-emerald-500" />
                  <span>Sourcing Shipping Addresses</span>
                </h3>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 rounded-lg cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Address
                  </button>
                )}
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="bg-slate-50/50 dark:bg-dark-bg p-5 rounded-2xl border border-slate-200/80 dark:border-slate-850 flex flex-col gap-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">New Address Profile</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Receiver Full Name"
                      value={addressPayload.fullName}
                      onChange={(e) => setAddressPayload(p => ({ ...p, fullName: e.target.value }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-850 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Receiver Mobile"
                      value={addressPayload.mobile}
                      onChange={(e) => setAddressPayload(p => ({ ...p, mobile: e.target.value }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-850 focus:outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Street Address, Unit / Suite"
                    value={addressPayload.addressLine}
                    onChange={(e) => setAddressPayload(p => ({ ...p, addressLine: e.target.value }))}
                    className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-855 focus:outline-none"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={addressPayload.city}
                      onChange={(e) => setAddressPayload(p => ({ ...p, city: e.target.value }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-850 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="State"
                      value={addressPayload.state}
                      onChange={(e) => setAddressPayload(p => ({ ...p, state: e.target.value }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-850 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Postal Code"
                      value={addressPayload.postalCode}
                      onChange={(e) => setAddressPayload(p => ({ ...p, postalCode: e.target.value }))}
                      className="py-1.5 px-3 border border-slate-200 rounded-lg text-xs bg-transparent dark:border-slate-850 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressPayload.isDefault}
                      onChange={(e) => setAddressPayload(p => ({ ...p, isDefault: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <label htmlFor="isDefault" className="text-xs font-semibold text-slate-650 dark:text-slate-350 cursor-pointer">
                      Set as default shipping address
                    </label>
                  </div>

                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="py-1.5 px-4 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:border-slate-850"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-1.5 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                    >
                      Add Address
                    </button>
                  </div>

                </form>
              )}

              {addresses.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 bg-slate-50 dark:bg-dark-bg rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                  No saved shipping addresses.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id} 
                      className={`relative p-4 rounded-2xl border border-slate-200 bg-white dark:border-slate-850 dark:bg-dark-card/50 flex justify-between items-start ${addr.isDefault ? 'border-emerald-500' : ''}`}
                    >
                      <div className="text-xs">
                        <p className="font-bold flex items-center gap-1.5">
                          <span>{addr.fullName}</span>
                          {addr.isDefault && (
                            <span className="text-[8px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450 px-1.5 py-0.2 rounded font-bold uppercase">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-slate-500 mt-1">{addr.addressLine}</p>
                        <p className="text-slate-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p className="text-slate-550 mt-1 font-semibold">Ph: {addr.mobile}</p>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Tab 3: Sourcing Order Logs */}
          {activeTab === 'orders' && (
            <div className="flex flex-col gap-6">
              
              <h3 className="text-sm font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ClipboardList className="h-4.5 w-4.5 text-emerald-500" />
                <span>Wholesale Purchase Records</span>
              </h3>

              {ordersLoading ? (
                <p className="text-xs text-slate-400">Loading purchase histories...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 bg-slate-50 dark:bg-dark-bg rounded-2xl border border-dashed border-slate-200 dark:border-slate-850">
                  No orders placed yet.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <div 
                      key={order._id} 
                      className="p-5 border border-slate-200/80 bg-white dark:border-slate-850 dark:bg-dark-card/50 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-sm"
                    >
                      <div className="text-xs flex flex-col gap-1">
                        <p className="font-bold flex items-center gap-2">
                          <span>Invoice: {order.invoiceNumber}</span>
                          <span className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-450' : 'bg-amber-100 text-amber-850'}`}>
                            {order.status}
                          </span>
                        </p>
                        <p className="text-slate-400">Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-slate-500 mt-1 font-semibold flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                          <span>Total: {formatINR(order.totalAmount)} ({order.items?.length || 0} items) | {order.paymentStatus}</span>
                        </p>
                      </div>

                      <Link
                        to={`/order-success?orderId=${order._id}`}
                        className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-450 self-end sm:self-auto cursor-pointer"
                      >
                        <span>View Invoice & Track</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
