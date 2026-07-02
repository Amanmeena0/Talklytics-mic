import { promises as fs } from 'fs';
import path from 'path';

const storePath = path.join(process.cwd(), 'dev_settings.json');

const defaultData = {
  integrations: [
    { id: '1', name: 'Slack', connected: false, config: '{}' },
    { id: '2', name: 'Salesforce', connected: false, config: '{}' },
    { id: '3', name: 'HubSpot', connected: false, config: '{}' }
  ],
  apiKeys: [] as any[],
  notifications: [
    {
      id: 'init-notif',
      userId: '1',
      title: 'Welcome to ConvinceSense',
      description: 'Your real-time AI sales pipeline monitor is ready.',
      type: 'SUCCESS',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]
};

export async function readStore() {
  try {
    const data = await fs.readFile(storePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If file doesn't exist, create it with default data
    await writeStore(defaultData);
    return defaultData;
  }
}

export async function writeStore(data: typeof defaultData) {
  await fs.writeFile(storePath, JSON.stringify(data, null, 2), 'utf-8');
}
