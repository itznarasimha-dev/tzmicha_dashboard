import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, ArrowLeft, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getInitials, getAvatarColor, formatRelativeTime } from '@/utils';
import { useAppStore } from '@/store/appStore';
import {
  useChatMessages, useSendChatMessage,
  useChatUnreadCounts, useSendDM,
  useUsers,
} from '@/hooks';
import { chatApi } from '@/services';

interface ChatMsg {
  id: string;
  text: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string; role: string };
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

function Avatar({ user, size = 7 }: { user: { name: string; avatar?: string }; size?: number }) {
  const cls = `size-${size} rounded-full object-cover`;
  return user.avatar
    ? <img src={user.avatar} alt={user.name} className={cls} />
    : <div className={cn(`size-${size} rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0`, getAvatarColor(user.name))}>{getInitials(user.name)}</div>;
}

function MessageBubble({ msg, isMe, showMeta }: { msg: ChatMsg; isMe: boolean; showMeta: boolean }) {
  return (
    <div className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
      {!isMe && (
        <div className="shrink-0 w-7">
          {showMeta && <Avatar user={msg.sender} size={7} />}
        </div>
      )}
      <div className={cn('flex flex-col max-w-[72%]', isMe ? 'items-end' : 'items-start')}>
        {showMeta && !isMe && (
          <p className="text-[10px] text-muted-foreground mb-0.5 px-1">{msg.sender.name.split(' ')[0]}</p>
        )}
        <div className={cn(
          'px-3 py-2 rounded-2xl text-[13px] leading-snug break-words',
          isMe ? 'bg-[#0EA5A4] text-white rounded-tr-sm' : 'bg-muted text-foreground rounded-tl-sm'
        )}>
          {msg.text}
        </div>
        <p className="text-[9px] text-muted-foreground mt-0.5 px-1">{formatRelativeTime(msg.createdAt)}</p>
      </div>
    </div>
  );
}

// ── Conversation view (group or DM) ──────────────────────────────────────────
function ConversationView({
  peer,
  currentUser,
  onBack,
}: {
  peer: Contact | null; // null = group chat
  currentUser: { id: string; name: string; avatar?: string; role: string };
  onBack: () => void;
}) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastTimeRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: initialMsgs, isLoading } = useChatMessages();
  const { mutate: sendGroup, isPending: sendingGroup } = useSendChatMessage();
  const { mutate: sendDM, isPending: sendingDM } = useSendDM();
  const isPending = peer ? sendingDM : sendingGroup;

  // Load initial messages (group) or DM history
  useEffect(() => {
    setMessages([]);
    lastTimeRef.current = null;

    if (!peer) {
      // group — handled by react-query
      return;
    }
    // DM — fetch directly
    chatApi.getDMHistory(peer.id).then((msgs: ChatMsg[]) => {
      setMessages(msgs);
      if (msgs.length) lastTimeRef.current = msgs[msgs.length - 1].createdAt;
    });
  }, [peer?.id]);

  // Sync group messages from react-query
  useEffect(() => {
    if (!peer && initialMsgs?.length) {
      setMessages(initialMsgs);
      lastTimeRef.current = initialMsgs[initialMsgs.length - 1].createdAt;
    }
  }, [peer, initialMsgs]);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages.length]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, [peer?.id]);

  // Polling
  const poll = useCallback(async () => {
    if (!lastTimeRef.current) return;
    try {
      const newMsgs: ChatMsg[] = peer
        ? await chatApi.pollDM(peer.id, lastTimeRef.current)
        : await chatApi.poll(lastTimeRef.current);
      if (newMsgs.length) {
        setMessages(prev => [...prev, ...newMsgs]);
        lastTimeRef.current = newMsgs[newMsgs.length - 1].createdAt;
      }
    } catch {}
  }, [peer?.id]);

  useEffect(() => {
    pollRef.current = setInterval(poll, 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [poll]);

  function handleSend() {
    const text = input.trim();
    if (!text || isPending) return;
    setInput('');
    const optimistic: ChatMsg = {
      id: `opt-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      sender: { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar, role: currentUser.role },
    };
    setMessages(prev => [...prev, optimistic]);

    if (peer) {
      sendDM({ peerId: peer.id, text }, {
        onSuccess: (real: ChatMsg) => {
          setMessages(prev => prev.map(m => m.id === optimistic.id ? real : m));
          lastTimeRef.current = real.createdAt;
        },
        onError: () => { setMessages(prev => prev.filter(m => m.id !== optimistic.id)); setInput(text); },
      });
    } else {
      sendGroup(text, {
        onSuccess: (real: ChatMsg) => {
          setMessages(prev => prev.map(m => m.id === optimistic.id ? real : m));
          lastTimeRef.current = real.createdAt;
        },
        onError: () => { setMessages(prev => prev.filter(m => m.id !== optimistic.id)); setInput(text); },
      });
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-card shrink-0">
        <button onClick={onBack} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <ArrowLeft className="size-4" />
        </button>
        {peer ? (
          <>
            <Avatar user={peer} size={7} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{peer.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{peer.role.replace(/_/g, ' ')}</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex size-7 items-center justify-center rounded-lg bg-[#0EA5A4] shrink-0">
              <Users className="size-3.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground">Team Chat</p>
              <p className="text-[10px] text-muted-foreground">{messages.length} messages</p>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {isLoading && !peer ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-5 text-muted-foreground animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageCircle className="size-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.sender.id === currentUser.id;
            const showMeta = i === 0 || messages[i - 1].sender.id !== msg.sender.id;
            return <MessageBubble key={msg.id} msg={msg} isMe={isMe} showMeta={showMeta} />;
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-3 py-2.5 border-t border-border bg-card">
        <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-9 px-3 rounded-xl border border-border bg-muted/60 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#0EA5A4]/30 focus:border-[#0EA5A4]/60 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isPending}
            className="flex size-9 items-center justify-center rounded-xl bg-[#0EA5A4] hover:bg-[#0c8f8e] disabled:opacity-40 text-white transition-colors shrink-0"
          >
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
          </button>
        </form>
      </div>
    </>
  );
}

// ── Contacts list ─────────────────────────────────────────────────────────────
function ContactsList({
  currentUser,
  onSelect,
  onSelectGroup,
}: {
  currentUser: { id: string };
  onSelect: (c: Contact) => void;
  onSelectGroup: () => void;
}) {
  const { data: usersData } = useUsers({ limit: 100 });
  const { data: unreadCounts = {} } = useChatUnreadCounts();
  const contacts: Contact[] = (usersData?.data ?? []).filter((u: Contact) => u.id !== currentUser.id);

  const totalGroupUnread = 0; // group unread tracked separately in parent

  return (
    <>
      <div className="px-3 py-2.5 border-b border-border shrink-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Messages</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {/* Group chat row */}
        <button
          onClick={onSelectGroup}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-[#0EA5A4] shrink-0">
            <Users className="size-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground">Team Chat</p>
            <p className="text-[11px] text-muted-foreground">Everyone</p>
          </div>
          {totalGroupUnread > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-[#0EA5A4] text-white text-[10px] font-bold">{totalGroupUnread}</span>
          )}
        </button>

        <div className="px-3 py-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Direct Messages</p>
        </div>

        {contacts.map(contact => {
          const unread = unreadCounts[contact.id] ?? 0;
          return (
            <button
              key={contact.id}
              onClick={() => onSelect(contact)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/60 transition-colors text-left"
            >
              <Avatar user={contact} size={9} />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">{contact.name}</p>
                <p className="text-[11px] text-muted-foreground capitalize truncate">{contact.role.replace(/_/g, ' ')}</p>
              </div>
              {unread > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-[#0EA5A4] text-white text-[10px] font-bold shrink-0">{unread > 9 ? '9+' : unread}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ── Main widget ───────────────────────────────────────────────────────────────
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'list' | 'conversation'>('list');
  const [activePeer, setActivePeer] = useState<Contact | null>(null); // null = group
  const [groupUnread, setGroupUnread] = useState(0);
  const currentUser = useAppStore(s => s.user);
  const { data: unreadCounts = {} } = useChatUnreadCounts();

  const totalDMUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);
  const totalUnread = totalDMUnread + groupUnread;

  // Poll group unread when widget is closed
  const lastGroupTimeRef = useRef<string | null>(null);
  useEffect(() => {
    if (open) { setGroupUnread(0); return; }
    const id = setInterval(async () => {
      if (!lastGroupTimeRef.current) {
        lastGroupTimeRef.current = new Date().toISOString();
        return;
      }
      try {
        const msgs = await chatApi.poll(lastGroupTimeRef.current);
        if (msgs.length) {
          lastGroupTimeRef.current = msgs[msgs.length - 1].createdAt;
          const fromOthers = msgs.filter((m: ChatMsg) => m.sender.id !== currentUser?.id).length;
          if (fromOthers > 0) setGroupUnread(n => n + fromOthers);
        }
      } catch {}
    }, 15000);
    return () => clearInterval(id);
  }, [open, currentUser?.id]);

  function openConversation(peer: Contact | null) {
    setActivePeer(peer);
    setView('conversation');
    if (!peer) setGroupUnread(0);
  }

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={() => setOpen(true)}
            className="relative flex size-13 items-center justify-center rounded-full bg-[#0EA5A4] hover:bg-[#0c8f8e] text-white shadow-floating transition-colors"
          >
            <MessageCircle className="size-5" />
            {totalUnread > 0 && (
              <motion.span
                key={totalUnread}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#F59E0B] text-white text-[10px] font-bold ring-2 ring-card"
              >
                {totalUnread > 9 ? '9+' : totalUnread}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 right-0 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-modal overflow-hidden flex flex-col"
            style={{ height: 500 }}
          >
            {/* Top bar (only on list view) */}
            {view === 'list' && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#0EA5A4]">
                    <MessageCircle className="size-3.5 text-white" />
                  </div>
                  <p className="text-[13px] font-bold text-foreground">Chat</p>
                  {totalUnread > 0 && (
                    <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold">
                      {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {/* Close button overlay for conversation view */}
            {view === 'conversation' && (
              <div className="absolute top-2.5 right-3 z-10">
                <button
                  onClick={() => setOpen(false)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {view === 'list' ? (
              <ContactsList
                currentUser={currentUser}
                onSelect={c => openConversation(c)}
                onSelectGroup={() => openConversation(null)}
              />
            ) : (
              <ConversationView
                peer={activePeer}
                currentUser={currentUser}
                onBack={() => setView('list')}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
