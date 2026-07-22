import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, CreditCard, TrendingDown, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';

const transactions = [
  { id: 1, type: 'debit',  description: 'SMS Campaign — Flash Sale Alert',       amount: -284.50, date: '2025-02-18', channel: 'SMS',      messages: 120400 },
  { id: 2, type: 'credit', description: 'Wallet Top-up',                          amount: 1000.00, date: '2025-02-15', channel: null,       messages: null },
  { id: 3, type: 'debit',  description: 'WhatsApp Campaign — Diwali Promo',       amount: -421.00, date: '2025-02-12', channel: 'WhatsApp', messages: 84200 },
  { id: 4, type: 'debit',  description: 'Email Campaign — Q2 Product Launch',     amount: -48.20,  date: '2025-02-10', channel: 'Email',    messages: 48200 },
  { id: 5, type: 'credit', description: 'Wallet Top-up',                          amount: 2000.00, date: '2025-02-05', channel: null,       messages: null },
  { id: 6, type: 'debit',  description: 'RCS Campaign — Product Showcase',        amount: -168.00, date: '2025-02-03', channel: 'RCS',      messages: 42000 },
  { id: 7, type: 'debit',  description: 'Voice Campaign — Support Follow-up',     amount: -96.00,  date: '2025-01-28', channel: 'Voice',    messages: 8000 },
  { id: 8, type: 'debit',  description: 'AI Fallback — OTP Delivery Chain',       amount: -62.40,  date: '2025-01-25', channel: 'AI',       messages: 18420 },
];

const channelRates = [
  { channel: 'SMS',       rate: '$0.0024/msg', color: 'bg-blue-500',    monthly: '$284' },
  { channel: 'WhatsApp',  rate: '$0.0050/msg', color: 'bg-green-500',   monthly: '$421' },
  { channel: 'RCS',       rate: '$0.0040/msg', color: 'bg-violet-500',  monthly: '$168' },
  { channel: 'Email',     rate: '$0.0010/msg', color: 'bg-rose-500',    monthly: '$48' },
  { channel: 'Voice',     rate: '$0.0120/msg', color: 'bg-amber-500',   monthly: '$96' },
  { channel: 'AI Fallback', rate: '$0.0034/msg', color: 'bg-slate-500', monthly: '$62' },
];

export function WalletPage() {
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState('');

  const balance = 4280.00;
  const totalSpent = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalTopup = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="Manage your messaging credits and billing"
        breadcrumbs={[{ label: 'Marketing' }, { label: 'Wallet' }]}
        actions={<Button size="md" onClick={() => setShowTopup(p => !p)}><Plus className="size-4" /> Top Up Wallet</Button>}
      />

      {/* Balance card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="lg" className="sm:col-span-1 bg-gradient-to-br from-rose-500 to-rose-600 border-rose-400 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="size-5 text-white/80" />
            <p className="text-sm font-semibold text-white/80">Available Balance</p>
          </div>
          <p className="text-4xl font-black text-white">${balance.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
          {balance < 500 && (
            <div className="flex items-center gap-1.5 mt-3 text-white/90 text-xs font-semibold">
              <AlertTriangle className="size-3.5" /> Low balance — top up soon
            </div>
          )}
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-2 mb-1"><TrendingDown className="size-4 text-red-500" /><p className="text-xs text-muted-foreground font-medium">Total Spent (Feb)</p></div>
          <p className="text-2xl font-bold text-red-600">${totalSpent.toFixed(2)}</p>
        </Card>
        <Card padding="md">
          <div className="flex items-center gap-2 mb-1"><CreditCard className="size-4 text-emerald-500" /><p className="text-xs text-muted-foreground font-medium">Total Top-ups (Feb)</p></div>
          <p className="text-2xl font-bold text-emerald-600">${totalTopup.toFixed(2)}</p>
        </Card>
      </div>

      {/* Top-up panel */}
      {showTopup && (
        <Card padding="lg">
          <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2"><CreditCard className="size-4 text-rose-500" /> Top Up Wallet</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['$100', '$500', '$1,000', '$2,000', '$5,000'].map(a => (
              <button key={a} onClick={() => setAmount(a.replace('$', '').replace(',', ''))}
                className={cn('px-4 py-2 rounded-lg border text-sm font-semibold transition-colors',
                  amount === a.replace('$', '').replace(',', '') ? 'bg-rose-600 text-white border-rose-600' : 'border-border bg-background text-foreground hover:bg-muted'
                )}>{a}</button>
            ))}
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-semibold text-foreground mb-1 block">Custom Amount ($)</label>
              <input type="number" className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <Button size="sm"><CreditCard className="size-3.5" /> Pay Now</Button>
            <Button size="sm" variant="outline" onClick={() => setShowTopup(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="px-5 pt-5 pb-3 border-b border-border">
              <p className="text-sm font-bold text-foreground">Transaction History</p>
            </div>
            <div className="divide-y divide-border">
              {transactions.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-5 py-3">
                  <div className={cn('flex size-8 items-center justify-center rounded-full shrink-0',
                    t.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-red-50 dark:bg-red-950/20'
                  )}>
                    {t.type === 'credit'
                      ? <ArrowDownLeft className="size-4 text-emerald-500" />
                      : <ArrowUpRight className="size-4 text-red-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{t.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{t.date}</span>
                      {t.channel && <Badge variant="muted" className="text-[9px]">{t.channel}</Badge>}
                      {t.messages && <span className="text-[10px] text-muted-foreground">{t.messages.toLocaleString()} msgs</span>}
                    </div>
                  </div>
                  <p className={cn('text-sm font-bold tabular-nums shrink-0', t.type === 'credit' ? 'text-emerald-600' : 'text-red-600')}>
                    {t.type === 'credit' ? '+' : ''}{t.amount.toFixed(2)}
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        {/* Channel rates */}
        <Card padding="none">
          <div className="px-5 pt-5 pb-3 border-b border-border">
            <p className="text-sm font-bold text-foreground">Channel Rates</p>
          </div>
          <div className="divide-y divide-border">
            {channelRates.map(r => (
              <div key={r.channel} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className={cn('size-2 rounded-full', r.color)} />
                  <p className="text-xs font-semibold text-foreground">{r.channel}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">{r.rate}</p>
                  <p className="text-[10px] text-muted-foreground">{r.monthly}/mo</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
