'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/Layout';
import Footer from '@/components/Footer';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';

  // State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  // Forms State
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  
  // Notification banner
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Show banner alert helper
  const showBanner = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load all configurations
  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const [userRes, integrationsRes, keysRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/integrations'),
        fetch('/api/notifications') // wait, let's load API keys! Wait, did we write API keys endpoint?
      ]);

      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u);
        setProfileName(u.name);
        setProfileEmail(u.email);
      }

      if (integrationsRes.ok) {
        const ints = await integrationsRes.json();
        setIntegrations(ints);
      }

      // Load API keys (since we store it in ApiKey model we should fetch it. Let's write keys fetch or retrieve inline)
      // Actually we will write a quick inline API key helper or add API routes for keys!
      // Let's query API keys using a route we will write, or mock keys locally in state if needed. But wait, we want a real database application!
      // Let's create an endpoint for API keys inside app/api/keys/route.ts!
      const keysRes2 = await fetch('/api/keys');
      if (keysRes2.ok) {
        const keys = await keysRes2.json();
        setApiKeys(keys);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Update URL query param when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`);
  };

  // Switch Active User Role
  const handleSwitchUser = async (email: string) => {
    try {
      const res = await fetch('/api/users/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        showBanner('User profile switched successfully.');
        loadConfig();
      }
    } catch (e) {
      showBanner('Failed to switch user.', 'error');
    }
  };

  // Save integration settings
  const handleToggleIntegration = async (name: string, currentConnected: boolean) => {
    // Find current config
    const target = integrations.find(i => i.name === name);
    if (!target) return;

    // Optimistic state
    setIntegrations(prev =>
      prev.map(i => (i.name === name ? { ...i, connected: !currentConnected } : i))
    );

    try {
      const res = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          connected: !currentConnected,
          config: target.config
        }),
      });
      if (!res.ok) throw new Error();
      showBanner(`${name} integration ${!currentConnected ? 'connected' : 'disconnected'}.`);
    } catch (e) {
      showBanner(`Failed to update ${name} integration.`, 'error');
      // Revert
      setIntegrations(prev =>
        prev.map(i => (i.name === name ? { ...i, connected: currentConnected } : i))
      );
    }
  };

  const handleSaveIntegrationConfig = async (name: string, updatedConfig: any) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          config: updatedConfig,
        }),
      });
      if (res.ok) {
        showBanner(`Saved ${name} configuration settings.`);
        loadConfig();
      }
    } catch (e) {
      showBanner('Error saving configuration.', 'error');
    }
  };

  // Create API Key
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedKey(data.key);
        setNewKeyName('');
        showBanner('Generated new API Key.');
        loadConfig();
      } else {
        throw new Error();
      }
    } catch (e) {
      showBanner('Failed to generate key.', 'error');
    }
  };

  // Revoke API Key
  const handleRevokeKey = async (id: string) => {
    try {
      const res = await fetch('/api/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showBanner('API Key revoked.');
        loadConfig();
      } else {
        throw new Error();
      }
    } catch (e) {
      showBanner('Failed to revoke API key.', 'error');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <main className="main-content">
          <div className="content-container">
            <h1 className="text-page-title">Settings &amp; Integrations</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading configurations...</p>
          </div>
          <Footer />
        </main>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="main-content">
        <div className="content-container">
          {/* Header */}
          <header style={{ marginBottom: 'var(--space-6)' }}>
            <h1 className="text-page-title">Settings &amp; Integrations</h1>
            <p className="text-body" style={{ marginTop: 'var(--space-1)' }}>
              Configure your workspace options, security API keys, and third-party CRM connections.
            </p>
          </header>

          {/* Banner notification */}
          {notification && (
            <div style={{
              background: notification.type === 'success' ? 'var(--success-muted)' : 'var(--error-muted)',
              color: notification.type === 'success' ? 'var(--success)' : 'var(--error)',
              border: `1px solid ${notification.type === 'success' ? 'var(--success)' : 'var(--error)'}`,
              padding: '12px var(--space-4)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeInUp 0.2s ease',
              fontSize: '13px'
            }}>
              <span className="material-symbols-outlined">{notification.type === 'success' ? 'check_circle' : 'error'}</span>
              <span>{notification.text}</span>
            </div>
          )}

          {/* Sidebar tabs + Content panel layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'var(--space-8)' }}>
            {/* Tabs List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => handleTabChange('profile')}
                className={`filter-tab ${activeTab === 'profile' ? 'active' : ''}`}
                style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', width: '100%', height: 'auto', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person</span>
                User Profile
              </button>
              
              <button
                onClick={() => handleTabChange('integrations')}
                className={`filter-tab ${activeTab === 'integrations' ? 'active' : ''}`}
                style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', width: '100%', height: 'auto', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>extension</span>
                CRM Integrations
              </button>

              <button
                onClick={() => handleTabChange('keys')}
                className={`filter-tab ${activeTab === 'keys' ? 'active' : ''}`}
                style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', width: '100%', height: 'auto', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>vpn_key</span>
                API Keys
              </button>
            </div>

            {/* Content panel */}
            <div className="card" style={{ padding: 'var(--space-6)', minHeight: '400px' }}>
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <h2 className="text-section-heading" style={{ marginBottom: '8px' }}>User Account Profile</h2>
                    <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Switch accounts or view your permission levels in the workspace.</p>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', background: 'var(--bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent)' }}>
                      <img src={user?.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{user?.name}</h4>
                      <p className="text-caption" style={{ margin: '2px 0 6px 0' }}>{user?.email}</p>
                      <span className="badge badge-accent" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{user?.role}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-4)' }}>
                    <h3 className="text-section-heading">Demo Workspace Role Switcher</h3>
                    <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Toggle roles to check the system behavior under different account access modes.</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button onClick={() => handleSwitchUser('jane.smith@convincesense.com')} className="btn btn-secondary" style={{ flex: 1 }}> Jane Smith (Sales Rep) </button>
                      <button onClick={() => handleSwitchUser('manager@convincesense.com')} className="btn btn-secondary" style={{ flex: 1 }}> Sarah Connor (Manager) </button>
                      <button onClick={() => handleSwitchUser('admin@convincesense.com')} className="btn btn-secondary" style={{ flex: 1 }}> Alex Rivera (Admin) </button>
                    </div>
                  </div>
                </div>
              )}

              {/* INTEGRATIONS TAB */}
              {activeTab === 'integrations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <h2 className="text-section-heading" style={{ marginBottom: '8px' }}>CRM &amp; Messaging Integrations</h2>
                    <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Connect real-time coaching metrics and compliance logs to your Salesforce CRM or Slack channels.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {integrations.map(int => {
                      const isSlack = int.name === 'Slack';
                      const isSF = int.name === 'Salesforce';
                      return (
                        <div key={int.id} style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)', padding: 'var(--space-4)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '32px', color: int.connected ? 'var(--accent)' : 'var(--text-muted)' }}>
                                {isSlack ? 'chat' : isSF ? 'cloud_done' : 'hub'}
                              </span>
                              <div>
                                <h4 style={{ margin: 0, fontWeight: 600 }}>{int.name}</h4>
                                <span style={{ fontSize: '11px', color: int.connected ? 'var(--success)' : 'var(--text-muted)' }}>
                                  {int.connected ? '● Connected' : 'Disconnected'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleIntegration(int.name, int.connected)}
                              className="btn btn-secondary"
                              style={{
                                background: int.connected ? 'transparent' : 'var(--accent)',
                                color: int.connected ? 'var(--text-primary)' : 'white',
                                borderColor: int.connected ? 'var(--border-default)' : 'var(--accent)'
                              }}
                            >
                              {int.connected ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>

                          {int.connected && (
                            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                              <h5 style={{ margin: '0 0 var(--space-2) 0', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Config options</h5>
                              {isSlack && (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    defaultValue={int.config?.channel || '#sales-alerts'}
                                    placeholder="Slack channel"
                                    style={{ background: 'var(--bg-root)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '12px', flex: 1 }}
                                    onBlur={(e) => handleSaveIntegrationConfig(int.name, { ...int.config, channel: e.target.value })}
                                  />
                                </div>
                              )}
                              {isSF && (
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    defaultValue={int.config?.instanceUrl || 'https://acme.my.salesforce.com'}
                                    placeholder="Salesforce domain"
                                    style={{ background: 'var(--bg-root)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: '12px', flex: 1 }}
                                    onBlur={(e) => handleSaveIntegrationConfig(int.name, { ...int.config, instanceUrl: e.target.value })}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* API KEYS TAB */}
              {activeTab === 'keys' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <h2 className="text-section-heading" style={{ marginBottom: '8px' }}>Security API Keys</h2>
                    <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Manage access tokens to secure REST API routes for your local agents.</p>
                  </div>

                  {/* Create Key Form */}
                  <form onSubmit={handleGenerateKey} style={{ display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Key name (e.g. CLI tool)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      style={{ background: 'var(--bg-root)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '8px 16px', fontSize: '13px', flex: 1, outline: 'none' }}
                    />
                    <button type="submit" className="btn btn-primary" disabled={!newKeyName.trim()}>Generate Key</button>
                  </form>

                  {/* Generated key display */}
                  {generatedKey && (
                    <div style={{ background: 'var(--accent-muted)', border: '1px dashed var(--accent)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent)' }}>COPY THIS KEY NOW. It will not be shown again.</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <code style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '13px', wordBreak: 'break-all' }}>{generatedKey}</code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedKey);
                            showBanner('Key copied to clipboard!');
                          }}
                          className="btn btn-ghost"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Keys list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 className="text-section-heading" style={{ fontSize: '13px' }}>Active API Keys</h4>
                    {apiKeys.length > 0 ? (
                      apiKeys.map(k => (
                        <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-elevated)', padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '13px', display: 'block' }}>{k.name}</span>
                            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                              CS-key-...{k.key.substring(k.key.length - 8)}
                            </span>
                          </div>
                          <button onClick={() => handleRevokeKey(k.id)} className="btn btn-ghost" style={{ color: 'var(--error)' }}>Revoke</button>
                        </div>
                      ))
                    ) : (
                      <p className="text-caption" style={{ margin: 0 }}>No active API keys created yet.</p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
        <Footer />
      </main>
    </Layout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <Layout>
        <main className="main-content">
          <div className="content-container">
            <h1 className="text-page-title">Settings &amp; Integrations</h1>
            <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Loading configurations...</p>
          </div>
          <Footer />
        </main>
      </Layout>
    }>
      <SettingsContent />
    </Suspense>
  );
}
