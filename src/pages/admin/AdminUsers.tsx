import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Shield,
  Search,
  CheckCircle2,
  KeyRound,
  UserPlus,
  Trash2,
  Edit,
  AlertTriangle,
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';

interface PlatformUser {
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'sales_rep' | string;
  must_change_password: boolean;
  created_at?: string;
}

interface ClientUsageUser {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  subscription_tier: 'Starter' | 'Growth' | 'Enterprise';
  status: string;
  voice_minutes_used: number;
  contacts_count: number;
  created_at: string;
}

export const AdminUsers: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'CREDENTIALS' | 'USAGE'>('CREDENTIALS');
  const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>([]);
  const [usageUsers, setUsageUsers] = useState<ClientUsageUser[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState<'sales_rep' | 'admin'>('sales_rep');
  const [addMustChange, setAddMustChange] = useState(true);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Edit / Change Password Modal State
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<'sales_rep' | 'admin'>('sales_rep');
  const [newPassword, setNewPassword] = useState('');
  const [editMustChange, setEditMustChange] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete User Confirmation State
  const [deletingUser, setDeletingUser] = useState<PlatformUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // API error state
  const [apiError, setApiError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchPlatformUsers = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 403 || res.status === 401) {
        setApiError('Access denied. Admin privileges required to manage users.');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPlatformUsers(data);
      } else {
        setApiError('Failed to load users. Please try again.');
      }
    } catch {
      setApiError('Could not connect to the server. Please check that the backend is running.');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  const fetchUsageUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users-usage`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setUsageUsers(data);
        }
      }
    } catch {
      // Fallback
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchPlatformUsers();
    fetchUsageUsers();
  }, [fetchPlatformUsers, fetchUsageUsers]);

  // Handle Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addEmail || !addPassword || !addName) {
      toast.error('Please complete all required fields.');
      return;
    }

    setIsSubmittingAdd(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          full_name: addName.trim(),
          email: addEmail.trim(),
          password: addPassword.trim(),
          role: addRole,
          must_change_password: addMustChange,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to create user.' }));
        throw new Error(err.detail || 'Failed to create user.');
      }

      toast.success(`User "${addName}" created successfully!`);
      setIsAddModalOpen(false);
      setAddName('');
      setAddEmail('');
      setAddPassword('');
      setAddRole('sales_rep');
      setAddMustChange(true);
      fetchPlatformUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create user.';
      toast.error(msg);
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // Open Edit / Change Password Modal
  const openEditModal = (user: PlatformUser) => {
    setEditingUser(user);
    setEditName(user.full_name || '');
    setEditRole((user.role === 'admin' ? 'admin' : 'sales_rep') as 'sales_rep' | 'admin');
    setNewPassword('');
    setEditMustChange(user.must_change_password);
  };

  // Handle Edit / Change Password
  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmittingEdit(true);
    try {
      const payload: Record<string, unknown> = {
        full_name: editName.trim(),
        role: editRole,
        must_change_password: editMustChange,
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await fetch(`${API_BASE}/api/admin/users/${editingUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to update user.' }));
        throw new Error(err.detail || 'Failed to update user.');
      }

      toast.success(`Credentials updated for ${editingUser.email}!`);
      setEditingUser(null);
      fetchPlatformUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update credentials.';
      toast.error(msg);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${deletingUser.user_id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to delete user.' }));
        throw new Error(err.detail || 'Failed to delete user.');
      }

      toast.success(`User ${deletingUser.email} deleted successfully.`);
      setDeletingUser(null);
      fetchPlatformUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete user.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPlatformUsers = platformUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      (u.full_name && u.full_name.toLowerCase().includes(query.toLowerCase())) ||
      u.role.toLowerCase().includes(query.toLowerCase())
  );

  const filteredUsageUsers = usageUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.full_name.toLowerCase().includes(query.toLowerCase()) ||
      u.subscription_tier.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-h1 font-bold text-foreground tracking-tight">Platform Users & Access Management</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-surface-1 border border-border-subtle text-foreground-secondary">
              {platformUsers.length} Platform Accounts
            </span>
          </div>
          <p className="text-body text-foreground-secondary">
            Provision user accounts, manage credentials, reset passwords, and audit login requirements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4 text-white" />}
            className="text-white"
          >
            <span className="text-white font-semibold">Add New User</span>
          </Button>
        </div>
      </div>

      {/* Tabs & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-surface-1 p-1 rounded-xl border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab('CREDENTIALS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'CREDENTIALS'
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            User Credentials & Security ({platformUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('USAGE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'USAGE'
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-tertiary hover:text-foreground'
            }`}
          >
            Client Subscriptions & Telemetry ({usageUsers.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-foreground-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-0 border border-border-subtle text-xs text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* TAB 1: USER CREDENTIALS & SECURITY */}
      {activeTab === 'CREDENTIALS' && (
        <div className="rounded-xl border border-border-subtle bg-surface-0 overflow-hidden shadow-xs">
          {apiError ? (
            <div className="px-6 py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">Access Error</p>
              <p className="text-xs text-foreground-tertiary">{apiError}</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-1 border-b border-border-subtle text-foreground-tertiary font-medium">
                <tr>
                  <th className="px-4 py-3">User Name & ID</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">First-Login Password Status</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredPlatformUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-foreground-tertiary">
                      {isLoading ? 'Loading users...' : 'No users match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredPlatformUsers.map((u) => (
                    <tr key={u.user_id} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span>{u.full_name || 'Unnamed User'}</span>
                          {u.email === 'admin@vidur.in' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/40 font-bold">
                              MASTER ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-foreground-tertiary">{u.email}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-primary/15 text-primary border border-primary/30'
                              : 'bg-surface-1 text-foreground-secondary border border-border-subtle'
                          }`}
                        >
                          {u.role === 'admin' ? 'Administrator' : 'Sales Representative'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {u.must_change_password ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            <KeyRound className="w-3 h-3" />
                            <span>Must Change on 1st Login</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Password Active</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-foreground-tertiary">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'System Seed'}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-1 hover:bg-surface-hover text-foreground-secondary hover:text-foreground border border-border-subtle transition-colors text-[11px] font-semibold"
                            title="Change password or edit credentials"
                          >
                            <KeyRound className="w-3.5 h-3.5 text-primary" />
                            <span>Change Password</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-foreground-tertiary hover:text-red-400 border border-transparent hover:border-red-500/30 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* TAB 2: CLIENT SUBSCRIPTIONS & TELEMETRY */}
      {activeTab === 'USAGE' && (
        <div className="rounded-xl border border-border-subtle bg-surface-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-1 border-b border-border-subtle text-foreground-tertiary font-medium">
                <tr>
                  <th className="px-4 py-3">Client Name & Email</th>
                  <th className="px-4 py-3">Subscription Tier</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Voice Usage</th>
                  <th className="px-4 py-3">Contacts</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredUsageUsers.map((u) => (
                  <tr key={u.user_id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground">{u.full_name}</div>
                      <div className="text-[11px] font-mono text-foreground-tertiary">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          u.subscription_tier === 'Enterprise'
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : u.subscription_tier === 'Growth'
                            ? 'bg-signal-qualified/15 text-signal-qualified border border-signal-qualified/30'
                            : 'bg-surface-1 text-foreground-secondary border border-border-subtle'
                        }`}
                      >
                        {u.subscription_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 text-signal-qualified font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-signal-qualified" />
                        Active
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-foreground">
                      {u.voice_minutes_used.toLocaleString()} mins
                    </td>
                    <td className="px-4 py-3.5 font-mono text-foreground">
                      {u.contacts_count.toLocaleString()} leads
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-1 text-foreground-tertiary border border-border-subtle">
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD NEW USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-0 border border-border-default rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Add New User</h3>
                  <p className="text-xs text-foreground-tertiary">Create a platform account with credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-foreground-tertiary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <Input
                label="User Full Name"
                id="add-user-name"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                leftIcon={<UserIcon className="w-4 h-4" />}
              />

              <Input
                label="User ID / Email"
                type="email"
                id="add-user-email"
                required
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                placeholder="e.g. rohan@vidur.in"
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Initial Temporary Password"
                type="password"
                id="add-user-password"
                required
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                placeholder="Set temporary password"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Access Role</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value as 'sales_rep' | 'admin')}
                  className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-border-subtle text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="sales_rep">Sales Representative</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="add-must-change"
                  checked={addMustChange}
                  onChange={(e) => setAddMustChange(e.target.checked)}
                  className="mt-0.5 rounded border-border-strong text-primary focus:ring-primary"
                />
                <label htmlFor="add-must-change" className="text-xs text-foreground cursor-pointer select-none leading-tight">
                  <span className="font-semibold block">Require password change on first login</span>
                  <span className="text-[11px] text-foreground-tertiary">
                    When the user signs in with this temporary password, they will be prompted to choose their own password.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingAdd}
                  className="text-white"
                >
                  <span className="text-white font-semibold">Create User</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PASSWORD / EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-0 border border-border-default rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Change Password & Credentials</h3>
                  <p className="text-xs text-foreground-tertiary font-mono">{editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-foreground-tertiary hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCredentials} className="space-y-3.5">
              <Input
                label="Full Name"
                id="edit-user-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
              />

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Access Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'sales_rep' | 'admin')}
                  className="w-full px-3 py-2 rounded-xl bg-surface-1 border border-border-subtle text-xs text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="sales_rep">Sales Representative</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <Input
                label="New Password (leave blank to keep unchanged)"
                type="password"
                id="edit-new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password to reset"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div className="p-3 rounded-xl bg-surface-1 border border-border-subtle flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="edit-must-change"
                  checked={editMustChange}
                  onChange={(e) => setEditMustChange(e.target.checked)}
                  className="mt-0.5 rounded border-border-strong text-primary focus:ring-primary"
                />
                <label htmlFor="edit-must-change" className="text-xs text-foreground cursor-pointer select-none leading-tight">
                  <span className="font-semibold block">Require password change on next login</span>
                  <span className="text-[11px] text-foreground-tertiary">
                    Forces this user to update their password immediately upon their next login.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmittingEdit}
                  className="text-white"
                >
                  <span className="text-white font-semibold">Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE USER CONFIRMATION */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-0 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Delete User Account?</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                Are you sure you want to delete <strong className="text-foreground">{deletingUser.email}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDeletingUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteUser}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

