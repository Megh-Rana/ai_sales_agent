import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  Trash2,
  Eye,
  KeyRound
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { AdminUser, AdminRole, UserStatus } from '../../types/admin';
import { toast } from 'sonner';

interface AdminUsersTabProps {
  users: AdminUser[];
  onUpdateUsers: (users: AdminUser[]) => void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onUpdateUsers,
  isAddModalOpen,
  setIsAddModalOpen
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<AdminRole>('Enterprise SDR');
  const [newUserCompany, setNewUserCompany] = useState('');

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.companyName.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, statusFilter]);

  const handleToggleStatus = (userId: string) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus: UserStatus = u.status === 'active' ? 'suspended' : 'active';
        toast.success(`User ${u.name} status changed to ${nextStatus.toUpperCase()}`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const handleReset2FA = (user: AdminUser) => {
    toast.info(`Dispatched two-factor authentication reset link to ${user.email}`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Please provide valid name and email address');
      return;
    }

    const created: AdminUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
      companyName: newUserCompany.trim() || 'Enterprise Workspace',
      lastActive: 'Just invited',
      twoFactorEnabled: true,
      voiceMinutesUsed: 0,
      assignedWorkspaces: [newUserCompany.trim() || 'General Sales'],
      createdAt: new Date().toISOString().slice(0, 10)
    };

    onUpdateUsers([created, ...users]);
    toast.success(`User ${created.name} successfully provisioned!`, {
      description: `Welcome credentials and 2FA invite sent to ${created.email}.`
    });

    // Reset and close
    setNewUserName('');
    setNewUserEmail('');
    setNewUserCompany('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-foreground-tertiary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name, email, company..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-1 border border-border-subtle rounded-lg text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface-1 border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Platform Admin">Platform Admin</option>
            <option value="Sales Ops Lead">Sales Ops Lead</option>
            <option value="Enterprise SDR">Enterprise SDR</option>
            <option value="Compliance Officer">Compliance Officer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface-1 border border-border-subtle rounded-lg text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="invited">Invited</option>
          </select>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<UserPlus className="w-3.5 h-3.5" />}
          className="text-xs shrink-0 font-semibold shadow-xs"
        >
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <div className="border border-border-default rounded-xl overflow-hidden bg-surface-1 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/70 border-b border-border-default text-foreground-secondary font-mono">
              <tr>
                <th className="p-3.5">User & Account</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Company Workspace</th>
                <th className="p-3.5">Security / 2FA</th>
                <th className="p-3.5">Voice Minutes</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface-elevated/40 transition-colors">
                  {/* User info */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/25 text-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {user.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{user.name}</div>
                        <div className="text-[11px] text-foreground-tertiary truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-3.5">
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold border ${
                      user.role === 'Super Admin'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        : user.role === 'Platform Admin'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : user.role === 'Sales Ops Lead'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : user.role === 'Compliance Officer'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-surface-2 text-foreground-secondary border-border-subtle'
                    }`}>
                      {user.role}
                    </span>
                  </td>

                  {/* Company */}
                  <td className="p-3.5 text-foreground-secondary">
                    <div className="font-medium text-foreground truncate max-w-[160px]">{user.companyName}</div>
                    <div className="text-[10px] text-foreground-tertiary">
                      Joined {user.createdAt}
                    </div>
                  </td>

                  {/* Security / 2FA */}
                  <td className="p-3.5">
                    {user.twoFactorEnabled ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        2FA Enforced
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-signal-urgent font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        Disabled
                      </span>
                    )}
                  </td>

                  {/* Voice Minutes */}
                  <td className="p-3.5 font-mono text-foreground-secondary">
                    <span className="font-semibold text-foreground">{user.voiceMinutesUsed}</span> min
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                      user.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {user.status.toUpperCase()}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="p-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReset2FA(user)}
                        title="Reset 2FA & Dispatch Verification"
                        className="p-1.5 text-foreground-tertiary hover:text-foreground"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleStatus(user.id)}
                        className={`text-[11px] font-medium px-2.5 py-1 ${
                          user.status === 'active'
                            ? 'text-signal-urgent hover:bg-signal-urgent/10'
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground">Provision New User Account</div>
              <p className="text-[11px] font-normal text-foreground-tertiary">
                Invite team members and assign security roles across the platform.
              </p>
            </div>
          </div>
        }
        maxWidth="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div>
            <label className="block text-foreground-secondary font-medium mb-1">Full Name</label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Aditi Rao"
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary/50 text-xs"
            />
          </div>

          <div>
            <label className="block text-foreground-secondary font-medium mb-1">Work Email</label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="aditi@company.com"
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary/50 text-xs"
            />
          </div>

          <div>
            <label className="block text-foreground-secondary font-medium mb-1">Company Workspace</label>
            <input
              type="text"
              value={newUserCompany}
              onChange={(e) => setNewUserCompany(e.target.value)}
              placeholder="e.g. CloudPoint Technologies"
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:border-primary/50 text-xs"
            />
          </div>

          <div>
            <label className="block text-foreground-secondary font-medium mb-1">Platform Role</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as AdminRole)}
              className="w-full px-3 py-2 bg-surface-elevated border border-border-default rounded-lg text-foreground focus:outline-none focus:border-primary/50 text-xs cursor-pointer"
            >
              <option value="Enterprise SDR">Enterprise SDR (Outreach & Calling)</option>
              <option value="Sales Ops Lead">Sales Ops Lead (Campaign Management)</option>
              <option value="Platform Admin">Platform Admin (Workspace Controls)</option>
              <option value="Compliance Officer">Compliance Officer (Audit & Security)</option>
              <option value="Super Admin">Super Admin (Global Root Access)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
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
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              className="font-semibold"
            >
              Provision & Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
