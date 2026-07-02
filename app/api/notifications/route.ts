import { NextResponse } from 'next/server';
import { readStore, writeStore } from '@/libs/localStore';

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json(store.notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, read, all, clearAll } = await request.json();
    const store = await readStore();

    if (clearAll) {
      store.notifications = [];
      await writeStore(store);
      return NextResponse.json({ success: true, message: 'All notifications cleared' });
    }

    if (all && read !== undefined) {
      store.notifications = store.notifications.map((n: any) => ({ ...n, read }));
      await writeStore(store);
      return NextResponse.json({ success: true, message: 'All notifications updated' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const notifIndex = store.notifications.findIndex((n: any) => n.id === id);
    if (notifIndex === -1) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    store.notifications[notifIndex].read = read;
    await writeStore(store);

    return NextResponse.json(store.notifications[notifIndex]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 });
  }
}
