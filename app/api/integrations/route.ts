import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/libs/localStore';

export async function GET() {
  try {
    const store = await readStore();
    const parsed = store.integrations.map((integration: any) => ({
      ...integration,
      config: JSON.parse(integration.config || '{}'),
    }));
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch integrations' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { name, connected, config } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Integration name is required' }, { status: 400 });
    }

    const store = await readStore();
    const index = store.integrations.findIndex((item: any) => item.name === name);
    if (index === -1) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const integration = store.integrations[index];
    if (connected !== undefined) {
      integration.connected = connected;
    }
    if (config !== undefined) {
      integration.config = JSON.stringify(config);
    }

    store.integrations[index] = integration;
    await writeStore(store);

    return NextResponse.json({
      ...integration,
      config: JSON.parse(integration.config || '{}'),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update integration' }, { status: 500 });
  }
}
