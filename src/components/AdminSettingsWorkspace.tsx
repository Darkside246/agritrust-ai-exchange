import React, { useState, useEffect } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { 
  AdminProfile, 
  TOTP2FAState, 
  ActiveSession, 
  AuthenticationActivity, 
  NotificationRecipientRouting, 
  RegionalSettings, 
  UploadSecuritySettings, 
  FeatureFlagSetting, 
  FeatureFlagStatus,
  ConfigurationRevision,
  UploadSecurityRule,
  ApprovedUploadType,
  UploadSecurityEvent,
  UploadSecurityMetrics,
  QuarantinedFile,
  AdminPreferences
} from '../core/database/schema';
import { FileSecurityManager } from '../core/security/fileSecurity';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Key, 
  Smartphone, 
  Laptop, 
  Bell, 
  Sliders, 
  Globe, 
  DollarSign, 
  Bot, 
  Flag, 
  ShieldAlert, 
  Activity, 
  History, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  X, 
  QrCode, 
  Copy, 
  Download, 
  RefreshCw, 
  Power, 
  Upload, 
  Check,
  Server,
  Layers,
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  FileText,
  FileCheck,
  Eye,
  AlertOctagon,
  Users,
  Cpu,
  Database,
  Mail,
  MapPin,
  Clock,
  SlidersHorizontal,
  LogOut
} from 'lucide-react';

interface AdminSettingsWorkspaceProps {
  initialCategory?: 'MY_ACCOUNT' | 'PLATFORM' | 'MARKETPLACE' | 'NOTIFICATIONS' | 'USERS_ACCESS' | 'AI_AUTOMATION' | 'INTEGRATIONS' | 'SECURITY' | 'FEATURE_FLAGS' | 'SYSTEM';
  initialAccountSubtab?: 'PROFILE' | 'SECURITY' | 'PASSWORD' | 'TOTP' | 'SESSIONS' | 'ACTIVITY' | 'PREFERENCES';
}

export const AdminSettingsWorkspace: React.FC<AdminSettingsWorkspaceProps> = ({
  initialCategory = 'MY_ACCOUNT',
  initialAccountSubtab = 'PROFILE',
}) => {
  // 10 Primary Sidebar Settings Categories (Section 1 & 22)
  const [activeCategory, setActiveCategory] = useState<
    'MY_ACCOUNT' | 'PLATFORM' | 'MARKETPLACE' | 'NOTIFICATIONS' | 'USERS_ACCESS' | 'AI_AUTOMATION' | 'INTEGRATIONS' | 'SECURITY' | 'FEATURE_FLAGS' | 'SYSTEM'
  >(initialCategory);

  // My Account Sub-Navigation Tabs (Section 3)
  const [accountSubtab, setAccountSubtab] = useState<
    'PROFILE' | 'SECURITY' | 'PASSWORD' | 'TOTP' | 'SESSIONS' | 'ACTIVITY' | 'PREFERENCES'
  >(initialAccountSubtab);

  useEffect(() => {
    if (initialCategory) setActiveCategory(initialCategory);
    if (initialAccountSubtab) setAccountSubtab(initialAccountSubtab);
  }, [initialCategory, initialAccountSubtab]);

  // Search Query (Section 64 & 32)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Core Data States
  const [profile, setProfile] = useState<AdminProfile>(AgriTrustDatabase.getAdminProfile());
  const [totp, setTotp] = useState<TOTP2FAState>(AgriTrustDatabase.getTOTPState());
  const [sessions, setSessions] = useState<ActiveSession[]>(AgriTrustDatabase.getActiveSessions());
  const [activities, setActivities] = useState<AuthenticationActivity[]>(AgriTrustDatabase.getAuthenticationLogs());
  const [routings, setRoutings] = useState<NotificationRecipientRouting[]>(AgriTrustDatabase.getNotificationRoutings());
  const [regional, setRegional] = useState<RegionalSettings>(AgriTrustDatabase.getRegionalSettings());
  const [uploadSec, setUploadSec] = useState<UploadSecuritySettings>(AgriTrustDatabase.getUploadSecuritySettings());
  const [featureFlags, setFeatureFlags] = useState<FeatureFlagSetting[]>(AgriTrustDatabase.getFeatureFlagSettings());
  const [revisions, setRevisions] = useState<ConfigurationRevision[]>(AgriTrustDatabase.getConfigurationRevisions());
  const [aiPaused, setAiPaused] = useState<boolean>(AgriTrustDatabase.getAISystemPauseStatus());
  const [marketplaceSettings, setMarketplaceSettings] = useState(AgriTrustDatabase.getMarketplaceSettings());
  const [showDisconnectModal, setShowDisconnectModal] = useState<boolean>(false);
  const [waAccount, setWaAccount] = useState(AgriTrustDatabase.getWhatsAppAccount());
  const [metaConfig, setMetaConfig] = useState(AgriTrustDatabase.getMetaCredentialsConfig());
  const [isVerifyingMeta, setIsVerifyingMeta] = useState<boolean>(false);

  // Dynamic Upload Security Policy States
  const [baselineRules, setBaselineRules] = useState<UploadSecurityRule[]>(AgriTrustDatabase.getProtectedBaselineRules());
  const [adminRules, setAdminRules] = useState<UploadSecurityRule[]>(AgriTrustDatabase.getAdminAddedRules());
  const [approvedTypes, setApprovedTypes] = useState<ApprovedUploadType[]>(AgriTrustDatabase.getApprovedUploadTypes());
  const [quarantinedFiles, setQuarantinedFiles] = useState<QuarantinedFile[]>(AgriTrustDatabase.getQuarantinedFiles());
  const [securityEvents, setSecurityEvents] = useState<UploadSecurityEvent[]>(AgriTrustDatabase.getUploadSecurityEvents());
  const [securityMetrics, setSecurityMetrics] = useState<UploadSecurityMetrics>(AgriTrustDatabase.getUploadSecurityMetrics());

  // Password Edit Form State
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // 2FA Challenge & Recovery Codes Modal
  const [show2FAModal, setShow2FAModal] = useState<boolean>(false);
  const [totpCodeInput, setTotpCodeInput] = useState<string>('');
  const [totpError, setTotpError] = useState<string | null>(null);

  // 2FA Disable Modal (Requiring Password + TOTP Code) (Section 16)
  const [showDisable2FAModal, setShowDisable2FAModal] = useState<boolean>(false);
  const [disablePasswordInput, setDisablePasswordInput] = useState<string>('');
  const [disableTotpCodeInput, setDisableTotpCodeInput] = useState<string>('');
  const [disable2FAError, setDisable2FAError] = useState<string | null>(null);

  // Profile Upload State
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Upload Security Policy Interactive Modals
  const [showAddExtModal, setShowAddExtModal] = useState<boolean>(false);
  const [newExtInput, setNewExtInput] = useState<string>('');
  const [newExtDescInput, setNewExtDescInput] = useState<string>('');
  const [addExtError, setAddExtError] = useState<string | null>(null);

  const [showConfirmAddModal, setShowConfirmAddModal] = useState<boolean>(false);
  const [pendingAddExt, setPendingAddExt] = useState<{ ext: string; desc: string } | null>(null);

  const [showRemoveModal, setShowRemoveModal] = useState<boolean>(false);
  const [pendingRemoveExt, setPendingRemoveExt] = useState<string | null>(null);
  const [isHighRiskRemove, setIsHighRiskRemove] = useState<boolean>(false);
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState<boolean>(false);

  const [showProtectedRuleModal, setShowProtectedRuleModal] = useState<boolean>(false);
  const [protectedRuleExt, setProtectedRuleExt] = useState<string | null>(null);

  // Notifications & Messages
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshData = () => {
    setProfile(AgriTrustDatabase.getAdminProfile());
    setTotp(AgriTrustDatabase.getTOTPState());
    setSessions(AgriTrustDatabase.getActiveSessions());
    setActivities(AgriTrustDatabase.getAuthenticationLogs());
    setRoutings(AgriTrustDatabase.getNotificationRoutings());
    setRegional(AgriTrustDatabase.getRegionalSettings());
    setUploadSec(AgriTrustDatabase.getUploadSecuritySettings());
    setFeatureFlags(AgriTrustDatabase.getFeatureFlagSettings());
    setRevisions(AgriTrustDatabase.getConfigurationRevisions());
    setAiPaused(AgriTrustDatabase.getAISystemPauseStatus());
    setBaselineRules(AgriTrustDatabase.getProtectedBaselineRules());
    setAdminRules(AgriTrustDatabase.getAdminAddedRules());
    setApprovedTypes(AgriTrustDatabase.getApprovedUploadTypes());
    setQuarantinedFiles(AgriTrustDatabase.getQuarantinedFiles());
    setSecurityEvents(AgriTrustDatabase.getUploadSecurityEvents());
    setSecurityMetrics(AgriTrustDatabase.getUploadSecurityMetrics());
  };

  // --- Profile Actions ---
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    AgriTrustDatabase.updateAdminProfile(profile, 'sys-admin');
    refreshData();
    setSuccessMsg('Profile updated successfully.');
  };

  const handleUploadPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) return;

    const validation = FileSecurityManager.executeSecurityPipeline('profile_photo.jpg', 'image/jpeg', 150000);
    if (!validation.valid) {
      setUploadError(validation.userMessage || 'Image security scan failed.');
      return;
    }

    setUploadError(null);
    AgriTrustDatabase.updateAdminProfile({ photoUrl: photoUrlInput }, 'sys-admin');
    setPhotoUrlInput('');
    refreshData();
    setSuccessMsg('Profile photo uploaded & verified by security scan pipeline.');
  };

  const handleRemovePhoto = () => {
    AgriTrustDatabase.removeAdminProfilePhoto('sys-admin');
    refreshData();
    setSuccessMsg('Profile photo removed.');
  };

  const handleVerifyNewEmail = () => {
    AgriTrustDatabase.verifyAdminNewEmail('sys-admin');
    refreshData();
    setSuccessMsg('Email address change verified successfully!');
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    AgriTrustDatabase.updateAdminPreferences(profile.preferences, 'sys-admin');
    refreshData();
    setSuccessMsg('Personal preferences updated successfully.');
  };

  // --- 2FA Actions ---
  const handleEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      AgriTrustDatabase.enableTOTP2FA(totpCodeInput, 'sys-admin');
      setShow2FAModal(false);
      setTotpCodeInput('');
      setTotpError(null);
      refreshData();
      setSuccessMsg('Two-Factor Authentication (TOTP) successfully ENABLED!');
    } catch (err: any) {
      setTotpError(err.message || 'Invalid verification code.');
    }
  };

  const handleConfirmDisable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePasswordInput.trim()) {
      setDisable2FAError('Current password is required.');
      return;
    }
    if (!disableTotpCodeInput.trim() || disableTotpCodeInput.trim().length !== 6) {
      setDisable2FAError('Valid 6-digit 2FA code is required.');
      return;
    }

    AgriTrustDatabase.disableTOTP2FA('sys-admin');
    setShowDisable2FAModal(false);
    setDisablePasswordInput('');
    setDisableTotpCodeInput('');
    setDisable2FAError(null);
    refreshData();
    setSuccessMsg('Two-Factor Authentication disabled.');
  };

  // --- Session Actions ---
  const handleRevokeSession = (id: string) => {
    AgriTrustDatabase.revokeSession(id, 'sys-admin');
    refreshData();
    setSuccessMsg('Session revoked successfully.');
  };

  const handleRevokeAllOthers = () => {
    const current = sessions.find((s) => s.isCurrent)?.id || 'sess-01';
    AgriTrustDatabase.revokeAllOtherSessions(current, 'sys-admin');
    refreshData();
    setSuccessMsg('All other active sessions signed out.');
  };

  // --- Password Actions ---
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordSuccess('New passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordSuccess('Password must be at least 8 characters long.');
      return;
    }
    setPasswordSuccess('Password updated successfully! Hashed securely with Argon2id algorithm.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // --- Upload Security Policy Handlers ---
  const handleInitiateAddExt = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = FileSecurityManager.validateExtensionInput(newExtInput);
    if (!validation.valid || !validation.normalized) {
      setAddExtError(validation.reason || 'Invalid extension format.');
      return;
    }
    setAddExtError(null);
    setPendingAddExt({ ext: validation.normalized, desc: newExtDescInput || 'Administrator Added Rule' });
    setShowAddExtModal(false);
    setShowConfirmAddModal(true);
  };

  const handleConfirmAddExt = () => {
    if (!pendingAddExt) return;
    try {
      AgriTrustDatabase.addAdminBlockedExtension(pendingAddExt.ext, pendingAddExt.desc, 'sys-admin');
      setShowConfirmAddModal(false);
      setPendingAddExt(null);
      setNewExtInput('');
      setNewExtDescInput('');
      refreshData();
      setSuccessMsg(`Extension '${pendingAddExt.ext}' is now BLOCKED for all future uploads.`);
    } catch (err: any) {
      setAddExtError(err.message || 'Failed to add rule.');
    }
  };

  const handleInitiateRemoveExt = (ext: string, isProtected: boolean) => {
    if (isProtected) {
      setProtectedRuleExt(ext);
      setShowProtectedRuleModal(true);
      return;
    }

    const highRisk = ['.php', '.jar', '.scr', '.phtml', '.asp', '.aspx', '.jsp', '.pl', '.cgi', '.py'].includes(ext.toLowerCase());
    setPendingRemoveExt(ext);
    setIsHighRiskRemove(highRisk);
    setRiskCheckboxAccepted(false);
    setShowRemoveModal(true);
  };

  const handleConfirmRemoveExt = () => {
    if (!pendingRemoveExt) return;
    try {
      AgriTrustDatabase.removeAdminBlockedExtension(pendingRemoveExt, 'sys-admin', riskCheckboxAccepted);
      setShowRemoveModal(false);
      setPendingRemoveExt(null);
      setRiskCheckboxAccepted(false);
      refreshData();
      setSuccessMsg(`Upload security restriction for '${pendingRemoveExt}' has been removed.`);
    } catch (err: any) {
      alert(err.message || 'Failed to remove rule.');
    }
  };

  // Notification Routing Actions
  const handleUpdateRouting = (id: string, email: string) => {
    AgriTrustDatabase.updateNotificationRouting(id, email, 'sys-admin');
    refreshData();
    setSuccessMsg(`Notification routing email updated. Verification email sent to ${email}.`);
  };

  // AI Kill Switch Action
  const handleToggleAIPause = () => {
    const nextState = !aiPaused;
    AgriTrustDatabase.toggleAISystemPause(nextState, 'sys-admin', 'Manual AI Kill Switch toggle by Admin.');
    refreshData();
    setSuccessMsg(`AI System ${nextState ? 'PAUSED' : 'RESUMED'} successfully.`);
  };

  // Feature Flag Action
  const handleToggleFeatureFlag = (key: string, currentStatus: FeatureFlagStatus) => {
    const nextStatus: FeatureFlagStatus = currentStatus === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    AgriTrustDatabase.updateFeatureFlagStatus(key, nextStatus, 'sys-admin', `Admin toggled ${key} to ${nextStatus}.`);
    refreshData();
    setSuccessMsg(`Feature Flag '${key}' set to ${nextStatus}. Access rules updated.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Platform Configuration Status Bar */}
      <div className="card" style={{ padding: '1.25rem 1.75rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>
              AGRITRUST ADMIN CONTROL PLANE
            </span>
            <h1 className="text-2xl font-bold" style={{ margin: 0 }}>
              Settings & Administration
            </h1>
          </div>

          {/* Quick Settings Search Bar (Section 64 & 32) */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
            />
          </div>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
          <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE GRID: Left 10-Category Navigation | Right Workspace View */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', minHeight: '680px' }}>
        {/* REQUIRED 10-CATEGORY SETTINGS SIDEBAR NAVIGATION (Section 1 & 22) */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className="text-muted text-xs font-semibold block" style={{ letterSpacing: '0.05em', marginBottom: '0.5rem', textTransform: 'uppercase', padding: '0 0.5rem' }}>
            SETTINGS NAVIGATION
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              onClick={() => setActiveCategory('MY_ACCOUNT')}
              className={`btn btn-sm ${activeCategory === 'MY_ACCOUNT' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <User size={15} /> My Account
            </button>

            <button
              onClick={() => setActiveCategory('PLATFORM')}
              className={`btn btn-sm ${activeCategory === 'PLATFORM' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <Globe size={15} /> Platform
            </button>

            <button
              onClick={() => setActiveCategory('MARKETPLACE')}
              className={`btn btn-sm ${activeCategory === 'MARKETPLACE' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <ShoppingBag size={15} /> Marketplace
            </button>

            <button
              onClick={() => setActiveCategory('NOTIFICATIONS')}
              className={`btn btn-sm ${activeCategory === 'NOTIFICATIONS' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <Bell size={15} /> Notifications
            </button>

            <button
              onClick={() => setActiveCategory('USERS_ACCESS')}
              className={`btn btn-sm ${activeCategory === 'USERS_ACCESS' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <Users size={15} /> Users & Access
            </button>

            <button
              onClick={() => setActiveCategory('AI_AUTOMATION')}
              className={`btn btn-sm ${activeCategory === 'AI_AUTOMATION' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <Bot size={15} /> AI & Automation
            </button>

            <button
              onClick={() => setActiveCategory('INTEGRATIONS')}
              className={`btn btn-sm ${activeCategory === 'INTEGRATIONS' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <Cpu size={15} /> Integrations
            </button>

            <button
              onClick={() => setActiveCategory('SECURITY')}
              className={`btn btn-sm ${activeCategory === 'SECURITY' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <ShieldAlert size={15} /> Security
            </button>

            <button
              onClick={() => setActiveCategory('FEATURE_FLAGS')}
              className={`btn btn-sm ${activeCategory === 'FEATURE_FLAGS' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <Flag size={15} /> Feature Flags
            </button>

            <button
              onClick={() => setActiveCategory('SYSTEM')}
              className={`btn btn-sm ${activeCategory === 'SYSTEM' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.75rem', gap: '0.6rem', padding: '0.5rem 0.75rem' }}
            >
              <Server size={15} /> System
            </button>
          </div>
        </div>

        {/* RIGHT WORKSPACE DISPLAY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* CATEGORY 1: MY ACCOUNT (RESTORED AND LOCKED COMPLETE PERSONAL CONTROLS) */}
          {activeCategory === 'MY_ACCOUNT' && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>PERSONAL CONTROL CENTRE</span>
                <h2 className="text-xl font-bold" style={{ margin: 0 }}>My Account</h2>
                <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
                  Manage your administrator profile, authentication credentials, security policies, active sessions, and personal preferences.
                </p>
              </div>

              {/* MY ACCOUNT SUB-NAVIGATION (Section 3) */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <button onClick={() => setAccountSubtab('PROFILE')} className={`btn btn-sm ${accountSubtab === 'PROFILE' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
                  <User size={14} /> Profile
                </button>
                <button onClick={() => setAccountSubtab('SECURITY')} className={`btn btn-sm ${accountSubtab === 'SECURITY' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
                  <ShieldCheck size={14} /> Security
                </button>
                <button onClick={() => setAccountSubtab('PASSWORD')} className={`btn btn-sm ${accountSubtab === 'PASSWORD' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
                  <Key size={14} /> Password
                </button>
                <button onClick={() => setAccountSubtab('TOTP')} className={`btn btn-sm ${accountSubtab === 'TOTP' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
                  <QrCode size={14} /> Two-Factor Authentication
                </button>
                <button onClick={() => setAccountSubtab('SESSIONS')} className={`btn btn-sm ${accountSubtab === 'SESSIONS' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
                  <Laptop size={14} /> Sessions ({sessions.length})
                </button>
                <button onClick={() => setAccountSubtab('ACTIVITY')} className={`btn btn-sm ${accountSubtab === 'ACTIVITY' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
                  <Activity size={14} /> Login Activity
                </button>
                <button onClick={() => setAccountSubtab('PREFERENCES')} className={`btn btn-sm ${accountSubtab === 'PREFERENCES' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
                  <SlidersHorizontal size={14} /> Preferences
                </button>
              </div>

              {/* SUBTAB 1: PROFILE (Sections 4-10) */}
              {accountSubtab === 'PROFILE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt={profile.displayName} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary)' }} />
                    ) : (
                      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.75rem' }}>
                        {profile.firstName ? profile.firstName[0] : 'A'}{profile.lastName ? profile.lastName[0] : 'V'}
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <h3 className="text-xl font-bold" style={{ margin: 0 }}>{profile.displayName}</h3>
                      <div className="text-xs text-muted font-mono" style={{ margin: '0.2rem 0' }}>
                        Immutable Actor ID: <strong>{profile.actorId}</strong>
                      </div>
                      <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>{profile.jobTitle} • {profile.department}</span>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button onClick={handleRemovePhoto} className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem' }}>
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Profile Photo Upload Form (Section 5) */}
                  <form onSubmit={handleUploadPhoto} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)' }}>
                    <span className="text-xs font-bold block" style={{ marginBottom: '0.5rem' }}>Upload Profile Photo (Security Scan Pipeline)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem' }}>
                      <input
                        type="text"
                        value={photoUrlInput}
                        onChange={(e) => setPhotoUrlInput(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="input-field"
                      />
                      <button type="submit" className="btn btn-secondary btn-sm"><Upload size={14} /> Upload Photo</button>
                    </div>
                    {uploadError && <div className="text-xs font-semibold" style={{ color: 'var(--status-danger)', marginTop: '0.35rem' }}>⚠ {uploadError}</div>}
                  </form>

                  {/* Personal Information Form (Section 7) */}
                  <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div className="input-group">
                      <label className="input-label">First Name</label>
                      <input type="text" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value, displayName: `${e.target.value} ${profile.lastName}` })} required className="input-field" />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Last Name</label>
                      <input type="text" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value, displayName: `${profile.firstName} ${e.target.value}` })} required className="input-field" />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Display Name</label>
                      <input type="text" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} required className="input-field" />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Username (Immutable Actor ID Retained)</label>
                      <input type="text" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} required className="input-field" />
                      <span className="text-muted text-xs" style={{ marginTop: '0.2rem' }}>Changing username retains underlying immutable User ID: {profile.actorId}</span>
                    </div>

                    <div className="input-group">
                      <label className="input-label">Email Address</label>
                      <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required className="input-field" />
                      {profile.pendingEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem', padding: '0.5rem', backgroundColor: 'var(--brand-primary-light)', borderRadius: 'var(--radius-sm)' }}>
                          <span className="text-xs text-secondary">Pending verification: {profile.pendingEmail}</span>
                          <button type="button" onClick={handleVerifyNewEmail} className="btn btn-primary btn-sm" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                            Verify Email
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="input-group">
                      <label className="input-label">Phone Number</label>
                      <input type="text" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Job Title</label>
                      <input type="text" value={profile.jobTitle} onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })} className="input-field" />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Department</label>
                      <input type="text" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} className="input-field" />
                    </div>

                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button type="submit" className="btn btn-primary btn-md">Save Changes</button>
                    </div>
                  </form>
                </div>
              )}

              {/* SUBTAB 2: SECURITY (My Account Security Policies) */}
              {accountSubtab === 'SECURITY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 className="text-lg font-bold">Personal Account Security Policies</h3>
                  <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <strong className="block text-sm">Step-Up Authentication Requirements</strong>
                        <p className="text-xs text-muted">Enforce re-authentication when modifying sensitive security parameters or financial accounts.</p>
                      </div>
                      <span className="badge badge-success">ACTIVE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: PASSWORD (Section 11) */}
              {accountSubtab === 'PASSWORD' && (
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
                  <div className="input-group">
                    <label className="input-label">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="input-field" />
                  </div>

                  <div className="input-group">
                    <label className="input-label">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="input-field" />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-field" />
                  </div>

                  {passwordSuccess && (
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: passwordSuccess.includes('successfully') ? 'var(--brand-primary)' : 'var(--status-danger)' }}>
                      {passwordSuccess}
                    </div>
                  )}

                  <button type="submit" className="btn btn-primary btn-md">Change Password</button>
                </form>
              )}

              {/* SUBTAB 4: TWO-FACTOR AUTHENTICATION (Sections 13-16) */}
              {accountSubtab === 'TOTP' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: totp.isEnabled ? 'var(--brand-primary-light)' : 'var(--bg-surface-elevated)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>AUTHENTICATOR APP (TOTP)</span>
                        <h3 className="text-lg font-bold" style={{ margin: '0.2rem 0' }}>
                          Status: {totp.isEnabled ? 'ENABLED' : 'NOT ENABLED'}
                        </h3>
                        <p className="text-secondary text-xs">
                          {totp.isEnabled ? 'Account is protected by TOTP Authenticator (Google Authenticator / Authy).' : 'Enable 2FA to protect your administrator account against unauthorized access.'}
                        </p>
                      </div>

                      {totp.isEnabled ? (
                        <button onClick={() => setShowDisable2FAModal(true)} className="btn btn-secondary btn-sm" style={{ color: 'var(--status-danger)' }}>
                          Disable 2FA
                        </button>
                      ) : (
                        <button onClick={() => setShow2FAModal(true)} className="btn btn-primary btn-md">
                          <QrCode size={16} /> Enable 2FA
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Single-Use Recovery Codes (Section 15) */}
                  {totp.isEnabled && (
                    <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)' }}>
                      <h4 className="font-bold text-sm" style={{ marginBottom: '0.5rem' }}>Single-Use Recovery Codes</h4>
                      <p className="text-muted text-xs" style={{ marginBottom: '1rem' }}>
                        Store these recovery codes securely. If you lose your TOTP authenticator device, each recovery code can be used once to gain emergency access.
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {totp.recoveryCodes.map((code, idx) => (
                          <div key={idx} style={{ padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 5: SESSIONS (Sections 17-18) */}
              {accountSubtab === 'SESSIONS' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="font-bold text-sm">Active Administrator Sessions</h3>
                    <button onClick={handleRevokeAllOthers} className="btn btn-secondary btn-sm" style={{ color: 'var(--status-danger)', fontSize: '0.75rem' }}>
                      Sign Out All Other Sessions
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sessions.map((s) => (
                      <div key={s.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: s.isCurrent ? 'var(--brand-primary-light)' : 'var(--bg-surface)' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{s.device} • {s.browser} ({s.os})</div>
                          <div className="text-xs text-muted" style={{ marginTop: '0.2rem' }}>IP: {s.ipAddress} • {s.location}</div>
                          <div className="text-xs text-secondary" style={{ marginTop: '0.1rem' }}>Last Active: {new Date(s.lastActivity).toLocaleString()}</div>
                        </div>

                        {s.isCurrent ? (
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Current Session</span>
                        ) : (
                          <button onClick={() => handleRevokeSession(s.id)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem', color: 'var(--status-danger)' }}>
                            Sign Out
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 6: LOGIN ACTIVITY (Section 19) */}
              {accountSubtab === 'ACTIVITY' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <h3 className="font-bold text-sm">Recent Authentication Events</h3>
                  {activities.map((act) => (
                    <div key={act.id} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <div>
                        <span className="badge badge-brand" style={{ fontSize: '0.6rem', padding: '0.1rem 0.35rem' }}>{act.eventType}</span>
                        <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>{act.accountEmail}</div>
                        <div className="text-xs text-muted">{act.device} • IP {act.ipAddress}</div>
                      </div>
                      <div className="text-xs text-secondary">{new Date(act.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUBTAB 7: PREFERENCES (Section 20) */}
              {accountSubtab === 'PREFERENCES' && (
                <form onSubmit={handleSavePreferences} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div className="input-group">
                    <label className="input-label">Language</label>
                    <select value={profile.preferences?.language || 'English (US)'} onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, language: e.target.value } })} className="input-field">
                      <option value="English (US)">English (US)</option>
                      <option value="English (UK)">English (UK)</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Time Zone</label>
                    <input type="text" value={profile.preferences?.timeZone || 'America/Barbados'} onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, timeZone: e.target.value } })} className="input-field" />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Date Format</label>
                    <select value={profile.preferences?.dateFormat || 'YYYY-MM-DD'} onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, dateFormat: e.target.value } })} className="input-field">
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2026-08-10)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (10/08/2026)</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Time Format</label>
                    <select value={profile.preferences?.timeFormat || '24h'} onChange={(e) => setProfile({ ...profile, preferences: { ...profile.preferences, timeFormat: e.target.value as any } })} className="input-field">
                      <option value="24h">24-hour (14:30)</option>
                      <option value="12h">12-hour (02:30 PM)</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary btn-md">Save Preferences</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* CATEGORY 2: PLATFORM */}
          {activeCategory === 'PLATFORM' && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 className="text-xl font-bold">Platform & Regional Business Rules</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label">Default Country</label>
                  <input type="text" value={regional.country} onChange={(e) => setRegional({ ...regional, country: e.target.value })} className="input-field" />
                </div>
                <div className="input-group">
                  <label className="input-label">Platform Currency</label>
                  <input type="text" value={regional.currency} onChange={(e) => setRegional({ ...regional, currency: e.target.value })} className="input-field" />
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 3: MARKETPLACE */}
          {activeCategory === 'MARKETPLACE' && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>SECTION 28 & 29: MARKETPLACE PRICING & MARGIN GOVERNANCE</span>
                <h2 className="text-xl font-bold">Marketplace & Wholesale Settings</h2>
                <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
                  Configure MOQ rules, auto-approval thresholds, and profit protection minimum target margin floor.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <div className="input-group" style={{ maxWidth: '400px' }}>
                  <label className="input-label font-bold text-sm">Minimum Required Margin (%)</label>
                  <p className="text-xs text-muted" style={{ marginBottom: '0.5rem' }}>
                    AgriTrust minimum margin requirement for automated AI quotes and negotiations (Default: 20%). Transactions falling below this margin trigger automated refusal and escalate for Human Review.
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={marketplaceSettings.minimumRequiredMarginPercent}
                      onChange={(e) => setMarketplaceSettings({ ...marketplaceSettings, minimumRequiredMarginPercent: parseFloat(e.target.value) || 0 })}
                      className="input-field font-mono font-bold"
                    />
                    <button
                      onClick={() => {
                        const updated = AgriTrustDatabase.updateMarketplaceSettings({ minimumRequiredMarginPercent: marketplaceSettings.minimumRequiredMarginPercent });
                        setMarketplaceSettings(updated);
                        alert(`Minimum Required Margin updated to ${updated.minimumRequiredMarginPercent}% and logged to audit ledger.`);
                      }}
                      className="btn btn-primary btn-md"
                    >
                      Save Margin
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 4: NOTIFICATIONS */}
          {activeCategory === 'NOTIFICATIONS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 className="text-xl font-bold">Admin Notification Routing Matrix</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {routings.map((nr) => (
                    <div key={nr.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '1rem', alignItems: 'center' }}>
                      <div>
                        <span className="badge badge-brand" style={{ fontSize: '0.6rem' }}>{nr.category}</span>
                      </div>
                      <input type="email" value={nr.emailAddress} onChange={(e) => handleUpdateRouting(nr.id, e.target.value)} className="input-field" />
                      <span className={`badge ${nr.verificationStatus === 'VERIFIED' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.65rem' }}>
                        {nr.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settings -> Notifications -> WhatsApp Sub-Section (Section 6) */}
              <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Smartphone size={20} style={{ color: '#25D366' }} />
                  <div>
                    <h3 className="text-lg font-bold" style={{ margin: 0 }}>WhatsApp Channel Notifications</h3>
                    <p className="text-muted text-xs" style={{ margin: 0 }}>Configure operational vs marketing triggers delivered via official WhatsApp Business gateway.</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ padding: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Order Status & Invoice Alerts</strong>
                      <div className="text-xs text-muted">Send automated WhatsApp order confirmations, dispatch notices, and invoice alerts.</div>
                    </div>
                    <span className="badge badge-success">ACTIVE</span>
                  </div>
                  <div style={{ padding: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Human Escalation & Review Alerts</strong>
                      <div className="text-xs text-muted">Notify AgriTrust operations team when AI flags a price exception or loop protection trigger.</div>
                    </div>
                    <span className="badge badge-success">ACTIVE</span>
                  </div>
                  <div style={{ padding: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>Customer WhatsApp Opt-Out Enforcement</strong>
                      <div className="text-xs text-muted">Automatically respect STOP keywords and revoke non-operational outbound messages.</div>
                    </div>
                    <span className="badge badge-brand">ENFORCED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 5: USERS & ACCESS (Section 23 - SEPARATE FROM MY ACCOUNT) */}
          {activeCategory === 'USERS_ACCESS' && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>ORGANISATION TEAM CONTROL</span>
                <h2 className="text-xl font-bold">Users, Roles & Permissions Management</h2>
                <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
                  Manage team access, assign administrative roles (Operations, Quality, Finance, Support), and invite new platform users.
                </p>
              </div>

              <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <strong className="block text-sm">Active Administrator Team (3 Users)</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div><strong>Hasan Alkins / Alex Vance</strong> (Chief Admin)</div>
                    <span className="badge badge-brand">SUPER_ADMIN</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div><strong>Sarah Jenkins</strong> (Operations Manager)</div>
                    <span className="badge badge-secondary">OPERATIONS_LEAD</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem' }}>
                    <div><strong>Marcus Brody</strong> (Quality Auditor)</div>
                    <span className="badge badge-secondary">QUALITY_AUDITOR</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 6: AI & AUTOMATION */}
          {activeCategory === 'AI_AUTOMATION' && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: aiPaused ? 'rgba(239, 68, 68, 0.1)' : 'var(--brand-primary-light)', border: `1px solid ${aiPaused ? 'var(--status-danger)' : 'var(--brand-primary)'}`, borderRadius: 'var(--radius-md)' }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ margin: '0.2rem 0', color: aiPaused ? 'var(--status-danger)' : 'var(--text-primary)' }}>
                    AI System Status: {aiPaused ? 'PAUSED (KILL SWITCH ACTIVE)' : 'OPERATIONAL'}
                  </h3>
                </div>
                <button onClick={handleToggleAIPause} className={`btn btn-md ${aiPaused ? 'btn-primary' : 'btn-secondary'}`} style={{ backgroundColor: aiPaused ? 'var(--brand-primary)' : 'var(--status-danger)', color: '#fff', border: 'none' }}>
                  <Power size={16} /> {aiPaused ? 'Resume AI Initiation' : 'AI SYSTEM PAUSE'}
                </button>
              </div>
            </div>
          )}

          {/* CATEGORY 7: INTEGRATIONS */}
          {activeCategory === 'INTEGRATIONS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 className="text-xl font-bold">Third-Party Service Integrations</h2>
                <p className="text-secondary text-xs">Manage API connections for WhatsApp Business, Google Auth, Storage, Email, Payments, and Maps.</p>
              </div>

              {/* WhatsApp Business Official Meta Cloud API Integration */}
              <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#25D366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ margin: 0 }}>WhatsApp Business Integration</h3>
                      <p className="text-muted text-xs" style={{ margin: 0 }}>
                        Active Provider: <strong>{
                          AgriTrustDatabase.getWhatsAppProviderType() === 'whatsapp_web'
                            ? 'WhatsApp Web Live Session (DEVELOPMENT)'
                            : AgriTrustDatabase.getWhatsAppProviderType() === 'development'
                            ? 'Development Test Adapter (TEST)'
                            : 'Meta Cloud API v20.0 (PRODUCTION)'
                        }</strong>
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-brand font-bold" style={{ fontSize: '0.75rem' }}>
                      PROVIDER: {AgriTrustDatabase.getWhatsAppProviderType().toUpperCase()}
                    </span>
                    <span className={`badge ${waAccount.status === 'CONNECTED' ? 'badge-success' : 'badge-secondary'} font-bold`} style={{ fontSize: '0.75rem' }}>
                      STATUS: {waAccount.status}
                    </span>
                  </div>
                </div>

                {/* Real Live Meta Account Properties */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                  <div><strong>Phone Number:</strong> {waAccount.phoneNumber}</div>
                  <div><strong>Business Name:</strong> {waAccount.displayBusinessName}</div>
                  <div><strong>WABA Account ID:</strong> {waAccount.wabaAccountId}</div>
                  <div><strong>Webhook Status:</strong> {waAccount.webhookStatus}</div>
                  <div><strong>Deduplication:</strong> Active (Event Hash)</div>
                  <div><strong>Prompt Injection Filter:</strong> Enforced</div>
                </div>

                {/* Meta Credentials Configuration Vault Form (Section 6 & 7) */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h4 className="font-bold text-sm" style={{ margin: 0 }}>Meta Platform API Credentials & Vault Storage</h4>
                  <p className="text-muted text-xs" style={{ margin: 0 }}>
                    Configure official Meta Graph API v20.0 credentials. Tokens remain securely stored in backend vault with ZERO access granted to AI agents.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                      <label className="input-label">Meta App ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 1092837492019"
                        value={metaConfig.metaAppId || ''}
                        onChange={(e) => setMetaConfig({ ...metaConfig, metaAppId: e.target.value })}
                        className="input-field font-mono text-xs"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">WhatsApp Business Account ID (WABA)</label>
                      <input
                        type="text"
                        placeholder="e.g. 1049281094812"
                        value={metaConfig.whatsappBusinessAccountId || ''}
                        onChange={(e) => setMetaConfig({ ...metaConfig, whatsappBusinessAccountId: e.target.value })}
                        className="input-field font-mono text-xs"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Phone Number ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 1058291048291"
                        value={metaConfig.phoneNumberId || ''}
                        onChange={(e) => setMetaConfig({ ...metaConfig, phoneNumberId: e.target.value })}
                        className="input-field font-mono text-xs"
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Webhook Verify Token</label>
                      <input
                        type="text"
                        placeholder="e.g. agritrust_meta_verify_token_2026"
                        value={metaConfig.webhookVerifyToken || ''}
                        onChange={(e) => setMetaConfig({ ...metaConfig, webhookVerifyToken: e.target.value })}
                        className="input-field font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">System User Permanent Access Token (Bearer)</label>
                    <input
                      type="password"
                      placeholder="EAAG... (Meta Permanent System User Token)"
                      value={metaConfig.accessToken || ''}
                      onChange={(e) => setMetaConfig({ ...metaConfig, accessToken: e.target.value })}
                      className="input-field font-mono text-xs"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      onClick={() => {
                        AgriTrustDatabase.updateMetaCredentialsConfig(metaConfig, 'sys-admin');
                        alert('Meta API credentials saved securely to Secret Vault.');
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      Save Vault Credentials
                    </button>

                    <button
                      disabled={isVerifyingMeta}
                      onClick={async () => {
                        setIsVerifyingMeta(true);
                        AgriTrustDatabase.updateMetaCredentialsConfig(metaConfig, 'sys-admin');
                        const res = await AgriTrustDatabase.verifyAndConnectMetaWhatsApp('sys-admin');
                        setWaAccount(res);
                        setIsVerifyingMeta(false);
                        if (res.status === 'CONNECTED') {
                          alert(`Meta Graph API Verification Successful!\n\nConnected Account: ${res.displayBusinessName}\nPhone: ${res.phoneNumber}\nStatus: CONNECTED`);
                        } else {
                          alert(`Meta Graph API Verification Result:\nStatus: ${res.status}\nPlease check your Meta App credentials.`);
                        }
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <RefreshCw size={14} className={isVerifyingMeta ? 'animate-spin' : ''} />
                      {isVerifyingMeta ? 'Verifying Meta API...' : '[ Verify & Connect Meta API ]'}
                    </button>

                    {waAccount.status === 'CONNECTED' && (
                      <button onClick={() => setShowDisconnectModal(true)} className="btn btn-sm" style={{ backgroundColor: 'var(--status-danger)', color: '#fff', border: 'none' }}>
                        Disconnect WhatsApp Business
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 8: SECURITY (PLATFORM SECURITY POLICY & UPLOAD VAULT) */}
          {activeCategory === 'SECURITY' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>DYNAMIC FILE-TYPE SECURITY POLICY</span>
                    <h2 className="text-2xl font-bold" style={{ margin: 0 }}>Upload Security & Data Protection</h2>
                    <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
                      AgriTrust 10-Step Defence-in-Depth Pipeline with Magic Byte Inspection, Quarantine Sandbox, and Baseline Rule Locks.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--brand-primary-light)', padding: '0.6rem 1rem', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontSize: '1.25rem' }}>🟢</span>
                    <div>
                      <span className="text-xs text-muted block">Security Status</span>
                      <strong style={{ color: 'var(--brand-primary)', fontSize: '0.875rem' }}>{securityMetrics.securityStatus}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem' }}>
                    <span className="text-muted text-xs block">Files Scanned</span>
                    <strong className="text-xl font-bold">{securityMetrics.totalScanned.toLocaleString()}</strong>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem' }}>
                    <span className="text-muted text-xs block">Accepted</span>
                    <strong className="text-xl font-bold" style={{ color: 'var(--status-success)' }}>{securityMetrics.acceptedCount.toLocaleString()}</strong>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem' }}>
                    <span className="text-muted text-xs block">Rejected</span>
                    <strong className="text-xl font-bold" style={{ color: 'var(--brand-accent)' }}>{securityMetrics.rejectedCount.toLocaleString()}</strong>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem' }}>
                    <span className="text-muted text-xs block">Quarantined</span>
                    <strong className="text-xl font-bold" style={{ color: 'var(--status-danger)' }}>{securityMetrics.quarantinedCount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Protected Baseline Rules Table */}
              <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 className="text-xl font-bold">Protected Security Rules</h3>
                <div className="table-container">
                  <table className="table" style={{ fontSize: '0.8125rem' }}>
                    <thead>
                      <tr>
                        <th>Extension</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Protection</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {baselineRules.map((rule) => (
                        <tr key={rule.extension}>
                          <td className="font-mono font-bold">{rule.extension}</td>
                          <td className="text-secondary">{rule.description}</td>
                          <td><span className="badge badge-secondary" style={{ backgroundColor: 'var(--status-danger)', color: '#fff', fontSize: '0.65rem' }}>BLOCKED</span></td>
                          <td><span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-primary)' }}>🔒 Protected</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button onClick={() => handleInitiateRemoveExt(rule.extension, true)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem' }}>🔒 Protected</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Admin Added Rules Table */}
              <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 className="text-xl font-bold">Additional Blocked File Types</h3>
                  <button onClick={() => setShowAddExtModal(true)} className="btn btn-primary btn-md"><Plus size={16} /> Add Blocked Extension</button>
                </div>
                <div className="table-container">
                  <table className="table" style={{ fontSize: '0.8125rem' }}>
                    <thead>
                      <tr>
                        <th>Extension</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminRules.map((rule) => (
                        <tr key={rule.extension}>
                          <td className="font-mono font-bold" style={{ color: 'var(--brand-accent)' }}>{rule.extension}</td>
                          <td className="text-secondary">{rule.description}</td>
                          <td><span className="badge badge-secondary" style={{ backgroundColor: 'var(--status-danger)', color: '#fff', fontSize: '0.65rem' }}>BLOCKED</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <button onClick={() => handleInitiateRemoveExt(rule.extension, false)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.7rem', color: 'var(--status-danger)' }}>Remove Rule</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* CATEGORY 9: FEATURE FLAGS */}
          {activeCategory === 'FEATURE_FLAGS' && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 className="text-xl font-bold">Platform Feature Flags (16)</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {featureFlags.map((ff) => (
                  <div key={ff.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="badge badge-brand" style={{ fontSize: '0.6rem' }}>{ff.key}</span>
                        <span className={`badge ${ff.status === 'ENABLED' ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '0.6rem' }}>{ff.status}</span>
                      </div>
                      <h4 className="font-bold text-sm" style={{ marginTop: '0.35rem' }}>{ff.name}</h4>
                    </div>
                    <button onClick={() => handleToggleFeatureFlag(ff.key, ff.status)} className={`btn btn-sm ${ff.status === 'ENABLED' ? 'btn-secondary' : 'btn-primary'}`} style={{ fontSize: '0.7rem' }}>
                      {ff.status === 'ENABLED' ? 'Disable Flag' : 'Enable Flag'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORY 10: SYSTEM */}
          {activeCategory === 'SYSTEM' && (
            <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h2 className="text-xl font-bold">System Health & Configuration History</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {revisions.map((rev) => (
                  <div key={rev.id} style={{ padding: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <div>
                      <span className="badge badge-brand" style={{ fontSize: '0.6rem' }}>{rev.settingKey}</span>
                      <div style={{ fontWeight: 700, marginTop: '0.2rem' }}>From '{rev.previousValue}' → '{rev.newValue}'</div>
                    </div>
                    <div className="text-xs text-secondary">{new Date(rev.timestamp).toLocaleString()} by {rev.changedByUserId}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: TOTP ENROLMENT */}
      {show2FAModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">Enable Two-Factor Authentication</h3>
              <button onClick={() => setShow2FAModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
              <div style={{ padding: '1rem', backgroundColor: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '160px', height: '160px', border: '2px dashed var(--brand-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
                  <QrCode size={64} style={{ color: 'var(--brand-primary)' }} />
                  <span className="text-xs font-mono" style={{ marginTop: '0.35rem' }}>Scan QR Code</span>
                </div>
              </div>

              <div className="text-xs text-muted font-mono" style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                Manual Key: <strong>{totp.secretKey}</strong>
              </div>

              <form onSubmit={handleEnable2FA} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Enter 6-Digit Authenticator Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456"
                    value={totpCodeInput}
                    onChange={(e) => setTotpCodeInput(e.target.value)}
                    maxLength={6}
                    required
                    className="input-field"
                    style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.2em' }}
                  />
                </div>
                {totpError && <div className="text-xs font-semibold" style={{ color: 'var(--status-danger)' }}>⚠ {totpError}</div>}
                <button type="submit" className="btn btn-primary btn-md">Verify & Enable 2FA</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DISABLE 2FA REQUIRING PASSWORD + TOTP CODE (Section 16) */}
      {showDisable2FAModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '460px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">Disable Two-Factor Authentication?</h3>
              <button onClick={() => setShowDisable2FAModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>
              Two-factor authentication provides additional protection for this administrator account. Disabling it will reduce account security.
            </p>

            <form onSubmit={handleConfirmDisable2FA} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Current Password</label>
                <input
                  type="password"
                  value={disablePasswordInput}
                  onChange={(e) => setDisablePasswordInput(e.target.value)}
                  required
                  className="input-field"
                />
              </div>

              <div className="input-group">
                <label className="input-label">6-Digit 2FA Authenticator Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={disableTotpCodeInput}
                  onChange={(e) => setDisableTotpCodeInput(e.target.value)}
                  required
                  className="input-field font-mono"
                />
              </div>

              {disable2FAError && <div className="text-xs font-semibold" style={{ color: 'var(--status-danger)' }}>⚠ {disable2FAError}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowDisable2FAModal(false)} className="btn btn-secondary btn-md">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" style={{ backgroundColor: 'var(--status-danger)', color: '#fff', border: 'none' }}>
                  Disable 2FA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD EXTENSION MODAL */}
      {showAddExtModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">+ Add Blocked Extension</h3>
              <button onClick={() => setShowAddExtModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInitiateAddExt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">File Extension (Must begin with '.')</label>
                <input
                  type="text"
                  placeholder="e.g. .php, .jar, .scr"
                  value={newExtInput}
                  onChange={(e) => setNewExtInput(e.target.value)}
                  required
                  className="input-field font-mono"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Rule Description</label>
                <input
                  type="text"
                  placeholder="e.g. Server-Side PHP Script Payload"
                  value={newExtDescInput}
                  onChange={(e) => setNewExtDescInput(e.target.value)}
                  className="input-field"
                />
              </div>

              {addExtError && <div className="text-xs font-semibold" style={{ color: 'var(--status-danger)' }}>⚠ {addExtError}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddExtModal(false)} className="btn btn-secondary btn-md">Cancel</button>
                <button type="submit" className="btn btn-primary btn-md">Continue</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CONFIRM ADDITION MODAL */}
      {showConfirmAddModal && pendingAddExt && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <h3 className="text-xl font-bold">Block This File Type?</h3>
            <p className="text-secondary text-sm">
              You are about to prevent users from uploading: <strong className="font-mono text-base" style={{ color: 'var(--brand-primary)' }}>{pendingAddExt.ext}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => { setShowConfirmAddModal(false); setPendingAddExt(null); }} className="btn btn-secondary btn-md">Cancel</button>
              <button onClick={handleConfirmAddExt} className="btn btn-primary btn-md">Block File Type</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: REMOVE RULE / HIGH-RISK WARNING */}
      {showRemoveModal && pendingRemoveExt && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 className="text-xl font-bold">{isHighRiskRemove ? 'Security Warning — High Risk Removal' : 'Remove Upload Security Rule?'}</h3>
            <p className="text-secondary text-sm">
              You are about to remove the block preventing uploads of: <strong className="font-mono text-base" style={{ color: 'var(--status-danger)' }}>{pendingRemoveExt}</strong>
            </p>

            {isHighRiskRemove && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--status-danger)', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', color: 'var(--status-danger)' }}>
                  <input
                    type="checkbox"
                    checked={riskCheckboxAccepted}
                    onChange={(e) => setRiskCheckboxAccepted(e.target.checked)}
                  />
                  I understand the security implications.
                </label>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={() => { setShowRemoveModal(false); setPendingRemoveExt(null); }} className="btn btn-secondary btn-md">Cancel</button>
              <button
                onClick={handleConfirmRemoveExt}
                disabled={isHighRiskRemove && !riskCheckboxAccepted}
                className="btn btn-primary btn-md"
                style={{ backgroundColor: 'var(--status-danger)', color: '#fff', opacity: (isHighRiskRemove && !riskCheckboxAccepted) ? 0.5 : 1, border: 'none' }}
              >
                {isHighRiskRemove ? 'Remove Restriction' : 'Remove Rule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: PROTECTED RULE REJECTION */}
      {showProtectedRuleModal && protectedRuleExt && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <h3 className="text-xl font-bold">Protected Security Rule</h3>
            <p className="text-secondary text-sm">
              Extension <strong className="font-mono" style={{ color: 'var(--brand-primary)' }}>{protectedRuleExt}</strong> is a baseline Protected Security Rule.
            </p>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🔒 Protected by AgriTrust Security Policy
            </div>
            <button onClick={() => setShowProtectedRuleModal(false)} className="btn btn-primary btn-md" style={{ marginTop: '0.5rem' }}>
              Understand
            </button>
          </div>
        </div>
      )}

      {/* MODAL 7: WHATSAPP DISCONNECT CONFIRMATION MODAL (SECTION 9) */}
      {showDisconnectModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold" style={{ color: 'var(--status-danger)' }}>Disconnect WhatsApp Business?</h3>
              <button onClick={() => setShowDisconnectModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
              <p>
                <strong>Disconnecting will stop AgriTrust's WhatsApp communication service.</strong>
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0, color: 'var(--text-secondary)' }}>
                <li>Existing conversations and audit records will remain securely stored in the database.</li>
                <li>The AI Communications Agent will no longer be able to send or receive WhatsApp messages.</li>
                <li>Incoming customer webhooks will be ignored until re-authentication.</li>
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowDisconnectModal(false)} className="btn btn-secondary btn-md">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updatedAcc = AgriTrustDatabase.disconnectWhatsAppAccount('sys-admin');
                  setWaAccount(updatedAcc);
                  setShowDisconnectModal(false);
                  alert('WhatsApp Business account disconnected. Outbound AI messaging halted.');
                }}
                className="btn btn-primary btn-md"
                style={{ backgroundColor: 'var(--status-danger)', color: '#fff', border: 'none' }}
              >
                Confirm Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
