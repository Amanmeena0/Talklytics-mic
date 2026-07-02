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
  const [notification, setNotification] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
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
        fetch('/api/notifications'), // wait, let's load API keys! Wait, did we write API keys endpoint?
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
    const target = integrations.find((i) => i.name === name);
    if (!target) return;

    // Optimistic state
    setIntegrations((prev) =>
      prev.map((i) => (i.name === name ? { ...i, connected: !currentConnected } : i))
    );

    try {
      const res = await fetch('/api/integrations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          connected: !currentConnected,
          config: target.config,
        }),
      });
      if (!res.ok) throw new Error();
      showBanner(`${name} integration ${!currentConnected ? 'connected' : 'disconnected'}.`);
    } catch (e) {
      showBanner(`Failed to update ${name} integration.`, 'error');
      // Revert
      setIntegrations((prev) =>
        prev.map((i) => (i.name === name ? { ...i, connected: currentConnected } : i))
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
            <p className="text-body">Loading configurations...</p>
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
          <header className="mb-6">
            <h1 className="text-page-title">Settings &amp; Integrations</h1>
            <p className="text-body mt-1">
              Configure your workspace options, security API keys, and third-party CRM connections.
            </p>
          </header>

          {/* Banner notification */}
          {notification && (
            <div
              className={`p-3 rounded-md mb-6 d-flex align-center gap-2 fs-13 settings-banner ${notification.type === 'success' ? 'settings-banner--success' : 'settings-banner--error'}`}
            >
              <span className="material-symbols-outlined">
                {notification.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <span>{notification.text}</span>
            </div>
          )}

          {/* Sidebar tabs + Content panel layout */}
          <div className="settings-grid-layout">
            {/* Tabs List */}
            <div className="d-flex flex-col gap-1">
              <button
                onClick={() => handleTabChange('profile')}
                className={`filter-tab settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined fs-18">person</span>
                User Profile
              </button>

              <button
                onClick={() => handleTabChange('integrations')}
                className={`filter-tab settings-tab-btn ${activeTab === 'integrations' ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined fs-18">extension</span>
                CRM Integrations
              </button>

              <button
                onClick={() => handleTabChange('keys')}
                className={`filter-tab settings-tab-btn ${activeTab === 'keys' ? 'active' : ''}`}
              >
                <span className="material-symbols-outlined fs-18">vpn_key</span>
                API Keys
              </button>
            </div>

            {/* Content panel */}
            <div className="card min-h-400px p-6">
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="d-flex flex-col gap-6">
                  <div>
                    <h2 className="text-section-heading mb-2">User Account Profile</h2>
                    <p className="text-body">
                      Switch accounts or view your permission levels in the workspace.
                    </p>
                  </div>

                  <div className="settings-user-card">
                    <div className="settings-avatar-container">
                      <img src={user?.avatarUrl} alt="Avatar" className="settings-avatar-img" />
                    </div>
                    <div>
                      <h4 className="m-0 fs-16 font-semibold">{user?.name}</h4>
                      <p className="text-caption mt-1 mb-2">{user?.email}</p>
                        <span className="badge badge-accent fs-10 settings-role-badge">
                        {user?.role}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex flex-col gap-4 border-t-subtle pt-4">
                    <h3 className="text-section-heading">Demo Workspace Role Switcher</h3>
                    <p className="text-body">
                      Toggle roles to check the system behavior under different account access
                      modes.
                    </p>
                    <div className="d-flex gap-12px flex-wrap">
                      <button
                        onClick={() => handleSwitchUser('jane.smith@convincesense.com')}
                        className="btn btn-secondary flex-1"
                      >
                        {' '}
                        Jane Smith (Sales Rep){' '}
                      </button>
                      <button
                        onClick={() => handleSwitchUser('manager@convincesense.com')}
                        className="btn btn-secondary flex-1"
                      >
                        {' '}
                        Sarah Connor (Manager){' '}
                      </button>
                      <button
                        onClick={() => handleSwitchUser('admin@convincesense.com')}
                        className="btn btn-secondary flex-1"
                      >
                        {' '}
                        Alex Rivera (Admin){' '}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* INTEGRATIONS TAB */}
              {activeTab === 'integrations' && (
                <div className="d-flex flex-col gap-6">
                  <div>
                    <h2 className="text-section-heading mb-2">CRM &amp; Messaging Integrations</h2>
                    <p className="text-body">
                      Connect real-time coaching metrics and compliance logs to your Salesforce CRM
                      or Slack channels.
                    </p>
                  </div>

                  <div className="d-flex flex-col gap-4">
                    {integrations.map((int) => {
                      const isSlack = int.name === 'Slack';
                      const isSF = int.name === 'Salesforce';
                      return (
                        <div key={int.id} className="settings-integration-card">
                          <div className="d-flex justify-between align-center mb-3">
                            <div className="d-flex align-center gap-12px">
                              <span
                                className={`material-symbols-outlined fs-32 ${int.connected ? 'color-accent' : 'color-muted'}`}
                              >
                                {isSlack ? 'chat' : isSF ? 'cloud_done' : 'hub'}
                              </span>
                              <div>
                                <h4 className="m-0 font-semibold">{int.name}</h4>
                                <span
                                  className={`fs-11 ${int.connected ? 'color-success' : 'color-muted'}`}
                                >
                                  {int.connected ? '● Connected' : 'Disconnected'}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleToggleIntegration(int.name, int.connected)}
                              className={`btn btn-secondary ${int.connected ? 'settings-integration-btn--connected' : 'settings-integration-btn--disconnected'}`}
                            >
                              {int.connected ? 'Disconnect' : 'Connect'}
                            </button>
                          </div>

                          {int.connected && (
                            <div className="border-t-subtle pt-3 mt-3">
                              <h5 className="m-0 mb-2 fs-12 font-semibold color-secondary">
                                Config options
                              </h5>
                              {isSlack && (
                                <div className="d-flex gap-12px align-center">
                                  <input
                                    type="text"
                                    defaultValue={int.config?.channel || '#sales-alerts'}
                                    placeholder="Slack channel"
                                    className="settings-config-input"
                                    onBlur={(e) =>
                                      handleSaveIntegrationConfig(int.name, {
                                        ...int.config,
                                        channel: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              )}
                              {isSF && (
                                <div className="d-flex gap-12px align-center">
                                  <input
                                    type="text"
                                    defaultValue={
                                      int.config?.instanceUrl || 'https://acme.my.salesforce.com'
                                    }
                                    placeholder="Salesforce domain"
                                    className="settings-config-input"
                                    onBlur={(e) =>
                                      handleSaveIntegrationConfig(int.name, {
                                        ...int.config,
                                        instanceUrl: e.target.value,
                                      })
                                    }
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
                <div className="d-flex flex-col gap-6">
                  <div>
                    <h2 className="text-section-heading mb-2">Security API Keys</h2>
                    <p className="text-body">
                      Manage access tokens to secure REST API routes for your local agents.
                    </p>
                  </div>

                  {/* Create Key Form */}
                  <form onSubmit={handleGenerateKey} className="d-flex gap-12px">
                    <input
                      type="text"
                      placeholder="Key name (e.g. CLI tool)"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className="settings-api-input"
                    />
                    <button type="submit" className="btn btn-primary" disabled={!newKeyName.trim()}>
                      Generate Key
                    </button>
                  </form>

                  {/* Generated key display */}
                  {generatedKey && (
                    <div className="settings-generated-key-box">
                      <span className="fs-11 font-semibold color-accent">
                        COPY THIS KEY NOW. It will not be shown again.
                      </span>
                      <div className="d-flex justify-between align-center">
                        <code className="word-break-all fs-13 settings-mono-text">
                          {generatedKey}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedKey);
                            showBanner('Key copied to clipboard!');
                          }}
                          className="btn btn-ghost"
                          
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Keys list */}
                  <div className="d-flex flex-col gap-2">
                    <h4 className="text-section-heading fs-13">Active API Keys</h4>
                    {apiKeys.length > 0 ? (
                      apiKeys.map((k) => (
                        <div key={k.id} className="settings-key-row">
                          <div>
                            <span className="font-semibold fs-13 d-block">{k.name}</span>
                            <span className="fs-11 color-muted settings-mono-text">
                              CS-key-...{k.key.substring(k.key.length - 8)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRevokeKey(k.id)}
                            className="btn btn-ghost color-error"
                          >
                            Revoke
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-caption m-0">No active API keys created yet.</p>
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
    <Suspense
      fallback={
        <Layout>
          <main className="main-content">
            <div className="content-container">
              <h1 className="text-page-title">Settings &amp; Integrations</h1>
              <p className="text-body color-secondary">
                Loading configurations...
              </p>
            </div>
            <Footer />
          </main>
        </Layout>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
