'use client';

// ─── CHAT HISTORY ─────────────────────────────────────────────────────────────
// Live chats are retained for CHAT_RETENTION_DAYS (7), then converted to JSON
// archives. This section lists a user's archived threads with a read-only
// viewer and a one-click .json download — the canonical "chat history" record.
// When the Neon backend is wired, archives map to a chat_archives table whose
// payload column holds this exact JSON shape.

import React, { useState } from 'react';
import { useStore, CHAT_RETENTION_DAYS } from '@/store';
import type { ChatArchive } from '@/store';
import { Button, Modal } from '@/components/ui';
import { downloadJSON } from '@/components/export/ExportUtils';

const roleBubble: Record<string, { bg: string; align: 'flex-start' | 'flex-end' }> = {
  client:   { bg: 'var(--breeze)', align: 'flex-start' },
  operator: { bg: '#FFF7ED', align: 'flex-end' },
  admin:    { bg: 'var(--cloud)', align: 'flex-end' },
};

const ChatHistorySection: React.FC<{ role: 'client' | 'operator' | 'admin' }> = ({ role }) => {
  const { chatArchives, currentUser } = useStore();
  const [viewing, setViewing] = useState<ChatArchive | null>(null);

  if (!currentUser) return null;

  const mine = (chatArchives ?? [])
    .filter(a => role === 'admin' ? true : role === 'client' ? a.clientId === currentUser.id : a.operatorId === currentUser.id)
    .sort((a, b) => b.archivedAt.localeCompare(a.archivedAt));

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', fontFamily: 'var(--font-body)' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--midnight)', margin: 0 }}>
          🗂 Chat History
        </h3>
        <span style={{ fontSize: 12, color: 'var(--slate)' }}>
          Live chats are kept for {CHAT_RETENTION_DAYS} days, then archived here as JSON files.
        </span>
      </div>

      {mine.length === 0 ? (
        <div style={{ padding: '22px 18px', fontSize: 13, color: 'var(--slate)' }}>
          No archived chats yet. Conversations older than {CHAT_RETENTION_DAYS} days are automatically moved here.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {mine.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--mist)', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 200 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--polar)' }}>{a.jobId}</span>
                  {' · '}{role === 'client' ? (a.operatorName || 'ACT Team') : a.clientName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
                  {a.messageCount} message{a.messageCount !== 1 ? 's' : ''} · {fmt(a.fromDate)} – {fmt(a.toDate)} · archived {fmt(a.archivedAt)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" size="sm" onClick={() => setViewing(a)}>👁 View</Button>
                <Button variant="secondary" size="sm" onClick={() => downloadJSON(`ACT_Chat_${a.jobId}_${a.archivedAt.split('T')[0]}.json`, a)}>⬇ JSON</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read-only archive viewer */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Archived Chat — ${viewing.jobId}` : ''} maxWidth={560}>
        {viewing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'var(--cloud)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--slate)' }}>
              Read-only archive · {viewing.messageCount} messages · {fmt(viewing.fromDate)} – {fmt(viewing.toDate)}
            </div>
            <div style={{ maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 2px' }}>
              {viewing.messages.map(m => {
                const rb = roleBubble[m.senderRole] ?? roleBubble.client;
                return (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: rb.align }}>
                    <div style={{ background: rb.bg, borderRadius: 12, padding: '8px 12px', maxWidth: '85%', fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>
                      {m.content}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3 }}>
                      {m.senderName} · {new Date(m.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="secondary" fullWidth onClick={() => downloadJSON(`ACT_Chat_${viewing.jobId}_${viewing.archivedAt.split('T')[0]}.json`, viewing)}>
              ⬇ Download JSON
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatHistorySection;
