import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { readStore, writeStore } from '@/libs/localStore';

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json(store.apiKeys);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch API keys' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const store = await readStore();

    // Generate a secure API key
    const rawKey = `CS-key-${crypto.randomBytes(24).toString('hex')}`;
    const newKey = {
      id: crypto.randomUUID(),
      userId: '1',
      name,
      key: rawKey,
      createdAt: new Date().toISOString()
    };

    store.apiKeys.push(newKey);
    await writeStore(store);

    return NextResponse.json(newKey, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate API key' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
    }

    const store = await readStore();
    const keyIndex = store.apiKeys.findIndex((k: any) => k.id === id);

    if (keyIndex === -1) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    store.apiKeys.splice(keyIndex, 1);
    await writeStore(store);

    return NextResponse.json({ success: true, message: 'API key successfully revoked' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to revoke API key' }, { status: 500 });
  }
}
