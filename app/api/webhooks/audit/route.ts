import { NextResponse } from 'next/server';
import { getWebhookLogs } from '@/lib/discord-webhook';

export async function GET() {
  const logs = getWebhookLogs();
  return NextResponse.json({ success: true, logs });
}
