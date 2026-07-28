import { prisma, withRetry } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import {
  InvoiceStatus, PaymentStatus, ExpenseStatus, PayrollStatus, BudgetStatus,
  TaxStatus, InvestmentStatus, AuditAction,
  Prisma,
} from '@prisma/client';

const r = withRetry; // shorthand

// ─── Opening Balance ──────────────────────────────────────────────────────────

export async function getOpeningBalance() {
  return r(async () => {
    let ob = await prisma.financeOpeningBalance.findFirst();
    if (!ob) ob = await prisma.financeOpeningBalance.create({ data: { amount: 0 } });
    return ob;
  });
}

export async function setOpeningBalance(amount: number) {
  return r(async () => {
    const ob = await prisma.financeOpeningBalance.findFirst();
    if (ob) return prisma.financeOpeningBalance.update({ where: { id: ob.id }, data: { amount } });
    return prisma.financeOpeningBalance.create({ data: { amount } });
  });
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

type Period = 'month' | 'quarter' | 'year' | 'all';

function getPeriodRange(period: Period): { start: Date | null; end: Date | null } {
  const now = new Date();
  if (period === 'all') return { start: null, end: null };
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  if (period === 'month') {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
  }
  if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    return { start: new Date(now.getFullYear(), q * 3, 1), end };
  }
  // year
  return { start: new Date(now.getFullYear(), 0, 1), end };
}

function getPrevPeriodRange(period: Period): { start: Date | null; end: Date | null } {
  const now = new Date();
  if (period === 'all') return { start: null, end: null };
  if (period === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }
  if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), (q - 1) * 3, 1);
    const end = new Date(now.getFullYear(), q * 3, 0, 23, 59, 59, 999);
    return { start, end };
  }
  // year
  return {
    start: new Date(now.getFullYear() - 1, 0, 1),
    end: new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999),
  };
}

function dateFilter(start: Date | null, end: Date | null) {
  if (!start && !end) return {};
  return {
    ...(start && { gte: start }),
    ...(end && { lte: end }),
  };
}

export async function getDashboardSummary(period: Period = 'month') {
  return r(async () => {
    const { start, end } = getPeriodRange(period);
    const { start: prevStart, end: prevEnd } = getPrevPeriodRange(period);
    const df = dateFilter(start, end);
    const prevDf = dateFilter(prevStart, prevEnd);
    const hasDf = Object.keys(df).length > 0;
    const hasPrevDf = Object.keys(prevDf).length > 0;

    const [
      ob,
      // all-time for current balance
      allReceivedPayments, allApprovedExpenses, allPaidPayroll,
      // period-scoped
      paidInvoices, approvedExpenses, paidPayroll,
      // prev period
      prevPaidInvoices, prevApprovedExpenses, prevPaidPayroll,
      // pending/overdue split
      pendingInvoices, overdueInvoices,
      // budgets
      activeBudgets,
    ] = await Promise.all([
      getOpeningBalance(),
      // all-time for balance
      prisma.payment.aggregate({ where: { status: 'received', deletedAt: null }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { status: { in: ['approved', 'paid'] }, deletedAt: null }, _sum: { amount: true } }),
      prisma.payroll.aggregate({ where: { status: 'paid', deletedAt: null }, _sum: { netSalary: true } }),
      // period revenue
      prisma.invoice.aggregate({ where: { status: 'paid', deletedAt: null, ...(hasDf && { issueDate: df }) }, _sum: { grandTotal: true } }),
      // period expenses
      prisma.expense.aggregate({ where: { status: { in: ['approved', 'paid'] }, deletedAt: null, ...(hasDf && { expenseDate: df }) }, _sum: { amount: true } }),
      // period payroll
      prisma.payroll.aggregate({ where: { status: 'paid', deletedAt: null, ...(hasDf && { paymentDate: df }) }, _sum: { netSalary: true } }),
      // prev revenue
      prisma.invoice.aggregate({ where: { status: 'paid', deletedAt: null, ...(hasPrevDf && { issueDate: prevDf }) }, _sum: { grandTotal: true } }),
      // prev expenses
      prisma.expense.aggregate({ where: { status: { in: ['approved', 'paid'] }, deletedAt: null, ...(hasPrevDf && { expenseDate: prevDf }) }, _sum: { amount: true } }),
      // prev payroll
      prisma.payroll.aggregate({ where: { status: 'paid', deletedAt: null, ...(hasPrevDf && { paymentDate: prevDf }) }, _sum: { netSalary: true } }),
      // pending (sent/viewed)
      prisma.invoice.aggregate({ where: { status: { in: ['sent', 'viewed'] }, deletedAt: null }, _sum: { grandTotal: true }, _count: true }),
      // overdue
      prisma.invoice.aggregate({ where: { status: 'overdue', deletedAt: null }, _sum: { grandTotal: true }, _count: true }),
      // active budgets
      prisma.budget.findMany({ where: { status: 'active', deletedAt: null } }),
    ]);

    const revenue = paidInvoices._sum.grandTotal ?? 0;
    const totalExpenses = (approvedExpenses._sum.amount ?? 0) + (paidPayroll._sum.netSalary ?? 0);
    const netProfit = revenue - totalExpenses;
    const currentBalance = ob.amount + (allReceivedPayments._sum.amount ?? 0) - (allApprovedExpenses._sum.amount ?? 0) - (allPaidPayroll._sum.netSalary ?? 0);

    // % change vs prev period
    const prevRevenue = prevPaidInvoices._sum.grandTotal ?? 0;
    const prevExpenses = (prevApprovedExpenses._sum.amount ?? 0) + (prevPaidPayroll._sum.netSalary ?? 0);
    const prevProfit = prevRevenue - prevExpenses;
    const pctChange = (curr: number, prev: number) =>
      prev === 0 ? null : Math.round(((curr - prev) / Math.abs(prev)) * 100);
    const revenueChange = pctChange(revenue, prevRevenue);
    const expensesChange = pctChange(totalExpenses, prevExpenses);
    const profitChange = pctChange(netProfit, prevProfit);

    // budget utilization
    const budgetAllocated = activeBudgets.reduce((s: number, b: any) => s + b.allocated, 0);
    const budgetUsed = activeBudgets.reduce((s: number, b: any) => s + b.used, 0);
    const budgetUtilPct = budgetAllocated > 0 ? Math.round((budgetUsed / budgetAllocated) * 100) : 0;

    // avg days to payment (paid invoices in period)
    const paidInvoicesWithPayments = await prisma.invoice.findMany({
      where: { status: 'paid', deletedAt: null, ...(hasDf && { issueDate: df }) },
      select: { issueDate: true, payments: { where: { status: 'received' }, select: { paymentDate: true }, orderBy: { paymentDate: 'asc' }, take: 1 } },
    });
    const diffs = paidInvoicesWithPayments
      .filter((inv: any) => inv.payments.length > 0)
      .map((inv: any) => {
        const ms = new Date(inv.payments[0].paymentDate).getTime() - new Date(inv.issueDate).getTime();
        return ms / (1000 * 60 * 60 * 24);
      })
      .filter((d: number) => d >= 0);
    const avgDaysToPayment = diffs.length > 0 ? Math.round(diffs.reduce((s: number, d: number) => s + d, 0) / diffs.length) : null;

    // top 3 clients by paid invoice revenue in period
    const topClientsRaw = await prisma.invoice.groupBy({
      by: ['clientId'],
      where: { status: 'paid', deletedAt: null, ...(hasDf && { issueDate: df }) },
      _sum: { grandTotal: true },
      orderBy: { _sum: { grandTotal: 'desc' } },
      take: 3,
    });
    const topClientIds = topClientsRaw.map((c: any) => c.clientId);
    const topClientDetails = await prisma.financeClient.findMany({
      where: { id: { in: topClientIds }, deletedAt: null },
      select: { id: true, companyName: true },
    });
    const topClients = topClientsRaw.map((c: any) => ({
      clientId: c.clientId,
      companyName: topClientDetails.find((d: any) => d.id === c.clientId)?.companyName ?? 'Unknown',
      total: c._sum.grandTotal ?? 0,
    }));

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyPayroll = await prisma.payroll.aggregate({
      where: { month: { startsWith: monthKey }, status: 'paid', deletedAt: null },
      _sum: { netSalary: true },
    });

    const [recentInvoices, recentPayments, recentExpenses, recentPayroll] = await Promise.all([
      prisma.invoice.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5, include: { client: true } }),
      prisma.payment.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5, include: { invoice: { include: { client: true } } } }),
      prisma.expense.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.payroll.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 5, include: { employee: { select: { id: true, name: true, avatar: true, department: true } } } }),
    ]);

    return {
      currentBalance,
      revenue, totalExpenses, netProfit,
      revenueChange, expensesChange, profitChange,
      pendingInvoiceAmount: pendingInvoices._sum.grandTotal ?? 0,
      pendingInvoiceCount: pendingInvoices._count,
      overdueInvoiceAmount: overdueInvoices._sum.grandTotal ?? 0,
      overdueInvoiceCount: overdueInvoices._count,
      monthlyPayroll: monthlyPayroll._sum.netSalary ?? 0,
      activeBudgetCount: activeBudgets.length,
      budgetUtilPct, budgetAllocated, budgetUsed,
      avgDaysToPayment,
      topClients,
      recentInvoices, recentPayments, recentExpenses, recentPayroll,
    };
  });
}

// ─── Monthly Analytics ────────────────────────────────────────────────────────

export async function getMonthlyAnalytics(year: number) {
  return r(async () => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const data = await Promise.all(
      months.map(async (m) => {
        const monthKey = `${year}-${String(m).padStart(2, '0')}`;
        const startDate = new Date(year, m - 1, 1);
        const endDate = new Date(year, m, 0, 23, 59, 59);
        const [rev, exp, payroll] = await Promise.all([
          prisma.invoice.aggregate({ where: { status: 'paid', issueDate: { gte: startDate, lte: endDate }, deletedAt: null }, _sum: { grandTotal: true } }),
          prisma.expense.aggregate({ where: { status: { in: ['approved', 'paid'] }, expenseDate: { gte: startDate, lte: endDate }, deletedAt: null }, _sum: { amount: true } }),
          prisma.payroll.aggregate({ where: { status: 'paid', month: { startsWith: monthKey }, deletedAt: null }, _sum: { netSalary: true } }),
        ]);
        const revenue = rev._sum.grandTotal ?? 0;
        const expenses = (exp._sum.amount ?? 0) + (payroll._sum.netSalary ?? 0);
        return { month: monthKey, revenue, expenses, profit: revenue - expenses };
      })
    );
    return data;
  });
}

// ─── Expense Category Breakdown ───────────────────────────────────────────────

export async function getExpenseCategoryBreakdown() {
  return r(async () => {
    const result = await prisma.expense.groupBy({
      by: ['category'],
      where: { status: { in: ['approved', 'paid'] }, deletedAt: null },
      _sum: { amount: true },
    });
    return result.map(row => ({ category: row.category, total: row._sum.amount ?? 0 }));
  });
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function listClients(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const search = query.search as string | undefined;
    const where: Prisma.FinanceClientWhereInput = {
      deletedAt: null,
      ...(search && { companyName: { contains: search, mode: 'insensitive' } }),
    };
    const [data, total] = await Promise.all([
      prisma.financeClient.findMany({ where, skip, take: limit, orderBy: { companyName: 'asc' } }),
      prisma.financeClient.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

export async function createClient(data: any) {
  return r(() => prisma.financeClient.create({ data }));
}

export async function updateClient(id: string, data: any) {
  return r(() => prisma.financeClient.update({ where: { id }, data }));
}

export async function deleteClient(id: string) {
  return r(() => prisma.financeClient.update({ where: { id }, data: { deletedAt: new Date() } }));
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

async function generateInvoiceNumber(): Promise<string> {
  const last = await prisma.invoice.findFirst({ orderBy: { createdAt: 'desc' }, select: { invoiceNumber: true } });
  const lastNum = last ? parseInt(last.invoiceNumber.replace('INV-', '').replace(/\D/g, ''), 10) : 1000;
  return `INV-${String((isNaN(lastNum) ? 1000 : lastNum) + 1).padStart(4, '0')}`;
}

export async function listInvoices(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const { search, status, clientId, dateFrom, dateTo, sortBy, sortOrder } = query;
    const where: Prisma.InvoiceWhereInput = {
      deletedAt: null,
      ...(status && { status: status as InvoiceStatus }),
      ...(clientId && { clientId }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { client: { companyName: { contains: search, mode: 'insensitive' } } },
          { project: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(dateFrom || dateTo ? {
        issueDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      } : {}),
    };
    const order = (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    const orderBy: Prisma.InvoiceOrderByWithRelationInput =
      sortBy === 'amount' ? { grandTotal: order }
      : sortBy === 'dueDate' ? { dueDate: order }
      : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take: limit, orderBy,
        include: { client: true, items: true, _count: { select: { payments: true } } },
      }),
      prisma.invoice.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

export async function getInvoiceById(id: string) {
  return r(async () => {
    const inv = await prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: { client: true, items: true, payments: true },
    });
    if (!inv) throw new AppError('Invoice not found', 404);
    return inv;
  });
}

export async function createInvoice(data: any, createdById: string) {
  return r(async () => {
    const { items, clientId, project, discount, tax, notes, dueDate, status, issueDate } = data;
    const issueDt = issueDate ? new Date(issueDate) : new Date();
    const dueDt = new Date(dueDate);
    if (dueDt < issueDt) throw new AppError('Due date cannot be before issue date', 400);
    const invoiceNumber = await generateInvoiceNumber();
    const subtotal = items.reduce((s: number, i: any) => s + i.qty * i.price, 0);
    const grandTotal = subtotal - (discount ?? 0) + (tax ?? 0);
    return prisma.invoice.create({
      data: {
        invoiceNumber, clientId, project, subtotal,
        discount: discount ?? 0, tax: tax ?? 0, grandTotal,
        issueDate: issueDt, dueDate: dueDt, status: status ?? 'draft', notes, createdById,
        items: { create: items.map((i: any) => ({ item: i.item, description: i.description, qty: i.qty, price: i.price, amount: i.qty * i.price })) },
      },
      include: { client: true, items: true },
    });
  });
}

export async function updateInvoice(id: string, data: any) {
  return r(async () => {
    const { items, discount, tax, ...rest } = data;
    const inv = await prisma.invoice.findFirst({ where: { id, deletedAt: null } });
    if (!inv) throw new AppError('Invoice not found', 404);
    // date validation
    const issueDt = rest.issueDate ? new Date(rest.issueDate) : inv.issueDate;
    const dueDt = rest.dueDate ? new Date(rest.dueDate) : inv.dueDate;
    if (dueDt < issueDt) throw new AppError('Due date cannot be before issue date', 400);
    let updateData: any = { ...rest };
    if (items) {
      const subtotal = items.reduce((s: number, i: any) => s + i.qty * i.price, 0);
      const grandTotal = subtotal - (discount ?? inv.discount) + (tax ?? inv.tax);
      updateData = { ...updateData, subtotal, discount: discount ?? inv.discount, tax: tax ?? inv.tax, grandTotal };
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await prisma.invoiceItem.createMany({
        data: items.map((i: any) => ({ invoiceId: id, item: i.item, description: i.description, qty: i.qty, price: i.price, amount: i.qty * i.price })),
      });
    }
    if (rest.dueDate) updateData.dueDate = dueDt;
    if (rest.issueDate) updateData.issueDate = issueDt;
    return prisma.invoice.update({ where: { id }, data: updateData, include: { client: true, items: true } });
  });
}

export async function deleteInvoice(id: string) {
  return r(() => prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } }));
}

export async function duplicateInvoice(id: string, createdById: string) {
  return r(async () => {
    const original = await getInvoiceById(id);
    const invoiceNumber = await generateInvoiceNumber();
    return prisma.invoice.create({
      data: {
        invoiceNumber, clientId: original.clientId, project: original.project,
        subtotal: original.subtotal, discount: original.discount, tax: original.tax,
        grandTotal: original.grandTotal, dueDate: original.dueDate, status: 'draft',
        notes: original.notes, createdById,
        items: { create: original.items.map(i => ({ item: i.item, description: i.description, qty: i.qty, price: i.price, amount: i.amount })) },
      },
      include: { client: true, items: true },
    });
  });
}

export async function markInvoicePaid(id: string) {
  return r(() => prisma.invoice.update({ where: { id }, data: { status: 'paid' } }));
}

export async function sendInvoice(id: string) {
  return r(async () => {
    const inv = await prisma.invoice.findFirst({
      where: { id, deletedAt: null },
      include: { client: true },
    });
    if (!inv) throw new AppError('Invoice not found', 404);
    if (!inv.client?.email) throw new AppError('Client has no email address', 400);
    // Mark as sent (draft → sent; keep other statuses)
    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: inv.status === 'draft' ? 'sent' : inv.status },
      include: { client: true, items: true },
    });
    return { sent: true, invoice: updated };
  });
}

export async function bulkDeleteInvoices(ids: string[]) {
  return r(() => prisma.invoice.updateMany({
    where: { id: { in: ids }, deletedAt: null },
    data: { deletedAt: new Date() },
  }));
}

export async function bulkSendReminder(ids: string[]) {
  return r(async () => {
    const invoices = await prisma.invoice.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: { client: true },
    });
    const withEmail = invoices.filter((inv: any) => inv.client?.email);
    // In production: send reminder emails here via nodemailer/SES
    return { reminded: withEmail.length, skipped: invoices.length - withEmail.length };
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function listPayments(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const { search, status, method, dateFrom, dateTo } = query;
    const where: Prisma.PaymentWhereInput = {
      deletedAt: null,
      ...(status && { status: status as PaymentStatus }),
      ...(method && { paymentMethod: method }),
      ...(search && {
        OR: [
          { referenceNumber: { contains: search, mode: 'insensitive' } },
          { invoice: { invoiceNumber: { contains: search, mode: 'insensitive' } } },
          { invoice: { client: { companyName: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
      ...(dateFrom || dateTo ? {
        paymentDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { invoice: { include: { client: true } } },
      }),
      prisma.payment.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

export async function createPayment(data: any) {
  return r(async () => {
    const payment = await prisma.payment.create({
      data: { ...data, paymentDate: new Date(data.paymentDate) },
      include: { invoice: { include: { client: true } } },
    });
    if (data.status === 'received' && data.invoiceId) {
      await prisma.invoice.update({ where: { id: data.invoiceId }, data: { status: 'paid' } });
    }
    return payment;
  });
}

export async function updatePayment(id: string, data: any) {
  return r(async () => {
    const prev = await prisma.payment.findFirst({ where: { id, deletedAt: null } });
    if (!prev) throw new AppError('Payment not found', 404);
    const payment = await prisma.payment.update({
      where: { id },
      data: { ...data, ...(data.paymentDate && { paymentDate: new Date(data.paymentDate) }) },
      include: { invoice: { include: { client: true } } },
    });
    if (data.status === 'received' && prev.status !== 'received' && payment.invoiceId) {
      await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: 'paid' } });
    }
    return payment;
  });
}

export async function deletePayment(id: string) {
  return r(() => prisma.payment.update({ where: { id }, data: { deletedAt: new Date() } }));
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function getExpenseStats(query: any) {
  return r(async () => {
    const { search, category, dateFrom, dateTo } = query;
    const baseWhere: Prisma.ExpenseWhereInput = {
      deletedAt: null,
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { vendor: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(dateFrom || dateTo ? {
        expenseDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      } : {}),
    };
    const statuses = ['pending', 'approved', 'rejected', 'paid'] as const;
    const results = await Promise.all(
      statuses.map(s =>
        prisma.expense.aggregate({
          where: { ...baseWhere, status: s },
          _sum: { amount: true },
          _count: true,
        })
      )
    );
    const total = await prisma.expense.aggregate({ where: baseWhere, _sum: { amount: true }, _count: true });
    return {
      total:    { count: total._count, amount: total._sum.amount ?? 0 },
      pending:  { count: results[0]._count, amount: results[0]._sum.amount ?? 0 },
      approved: { count: results[1]._count, amount: results[1]._sum.amount ?? 0 },
      rejected: { count: results[2]._count, amount: results[2]._sum.amount ?? 0 },
      paid:     { count: results[3]._count, amount: results[3]._sum.amount ?? 0 },
    };
  });
}

export async function listExpenses(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const { search, status, category, dateFrom, dateTo, sortBy, sortOrder } = query;
    const where: Prisma.ExpenseWhereInput = {
      deletedAt: null,
      ...(status && { status: status as ExpenseStatus }),
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { vendor: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(dateFrom || dateTo ? {
        expenseDate: {
          ...(dateFrom && { gte: new Date(dateFrom) }),
          ...(dateTo && { lte: new Date(dateTo) }),
        },
      } : {}),
    };
    const order = (sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    const orderBy: Prisma.ExpenseOrderByWithRelationInput =
      sortBy === 'amount' ? { amount: order } : { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      prisma.expense.findMany({ where, skip, take: limit, orderBy }),
      prisma.expense.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

export async function createExpense(data: any) {
  return r(async () => {
    const expense = await prisma.expense.create({
      data: { ...data, expenseDate: new Date(data.expenseDate) },
    });
    // increment linked budget if budgetId provided
    if (data.budgetId) {
      const b = await prisma.budget.findFirst({ where: { id: data.budgetId, deletedAt: null } });
      if (b) {
        const used = b.used + expense.amount;
        await prisma.budget.update({ where: { id: b.id }, data: { used, remaining: b.allocated - used } });
      }
    }
    return expense;
  });
}

export async function updateExpense(id: string, data: any) {
  return r(async () => {
    const exp = await prisma.expense.findFirst({ where: { id, deletedAt: null } });
    if (!exp) throw new AppError('Expense not found', 404);
    const updated = await prisma.expense.update({
      where: { id },
      data: { ...data, ...(data.expenseDate && { expenseDate: new Date(data.expenseDate) }) },
    });
    // if budgetId changed or amount changed, adjust budget used
    const budgetId = data.budgetId ?? (exp as any).budgetId;
    if (budgetId && (data.amount !== undefined || data.budgetId !== undefined)) {
      const b = await prisma.budget.findFirst({ where: { id: budgetId, deletedAt: null } });
      if (b) {
        // recalculate: subtract old amount, add new
        const oldAmt = (exp as any).budgetId === budgetId ? exp.amount : 0;
        const newAmt = data.amount ?? exp.amount;
        const used = Math.max(0, b.used - oldAmt + newAmt);
        await prisma.budget.update({ where: { id: b.id }, data: { used, remaining: b.allocated - used } });
      }
    }
    return updated;
  });
}

export async function deleteExpense(id: string) {
  return r(() => prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } }));
}

export async function approveExpense(id: string, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const exp = await prisma.expense.findFirst({ where: { id, deletedAt: null } });
    if (!exp) throw new AppError('Expense not found', 404);
    if (exp.status !== 'pending') throw new AppError('Only pending expenses can be approved', 400);
    const after = await prisma.expense.update({ where: { id }, data: { status: 'approved' } });
    await audit(actorId, actorEmail, actorRole, 'approve', 'Expense', id, { before: { status: 'pending' }, after: { status: 'approved' } });
    return after;
  });
}

export async function rejectExpense(id: string, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const exp = await prisma.expense.findFirst({ where: { id, deletedAt: null } });
    if (!exp) throw new AppError('Expense not found', 404);
    if (exp.status !== 'pending') throw new AppError('Only pending expenses can be rejected', 400);
    const after = await prisma.expense.update({ where: { id }, data: { status: 'rejected' } });
    await audit(actorId, actorEmail, actorRole, 'reject', 'Expense', id, { before: { status: 'pending' }, after: { status: 'rejected' } });
    return after;
  });
}

export async function generateNextExpenseOccurrence(id: string) {
  return r(async () => {
    const exp = await prisma.expense.findFirst({ where: { id, deletedAt: null } });
    if (!exp) throw new AppError('Expense not found', 404);
    const freq: string = (exp as any).recurringFrequency;
    if (!(exp as any).isRecurring || !freq) throw new AppError('Expense is not recurring', 400);
    const base = new Date(exp.expenseDate);
    let next: Date;
    if (freq === 'monthly')    next = new Date(base.getFullYear(), base.getMonth() + 1, base.getDate());
    else if (freq === 'quarterly') next = new Date(base.getFullYear(), base.getMonth() + 3, base.getDate());
    else                        next = new Date(base.getFullYear() + 1, base.getMonth(), base.getDate());
    const { id: _id, createdAt, updatedAt, deletedAt, ...rest } = exp as any;
    return prisma.expense.create({ data: { ...rest, expenseDate: next, status: 'pending' } });
  });
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

export async function listPayroll(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const { search, status, month } = query;
    const where: Prisma.PayrollWhereInput = {
      deletedAt: null,
      ...(status && { status: status as PayrollStatus }),
      ...(month && { month: { startsWith: month } }),
      ...(search && { employee: { name: { contains: search, mode: 'insensitive' } } }),
    };
    const [data, total] = await Promise.all([
      prisma.payroll.findMany({
        where, skip, take: limit, orderBy: { createdAt: 'desc' },
        include: { employee: { select: { id: true, name: true, avatar: true, department: true, title: true } } },
      }),
      prisma.payroll.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

export async function createPayroll(data: any, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const netSalary = (data.basicSalary ?? 0) + (data.bonus ?? 0) + (data.allowances ?? 0) - (data.deductions ?? 0);
    const pr = await prisma.payroll.create({
      data: { ...data, netSalary, ...(data.paymentDate && { paymentDate: new Date(data.paymentDate) }) },
      include: { employee: { select: { id: true, name: true, avatar: true, department: true, title: true } } },
    });
    await audit(actorId, actorEmail, actorRole, 'create', 'Payroll', pr.id, {
      after: { basicSalary: pr.basicSalary, bonus: pr.bonus, allowances: pr.allowances, deductions: pr.deductions, netSalary: pr.netSalary },
    });
    return pr;
  });
}

export async function updatePayroll(id: string, data: any, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const pr = await prisma.payroll.findFirst({ where: { id, deletedAt: null } });
    if (!pr) throw new AppError('Payroll record not found', 404);
    const netSalary = (data.basicSalary ?? pr.basicSalary) + (data.bonus ?? pr.bonus) + (data.allowances ?? pr.allowances) - (data.deductions ?? pr.deductions);
    const after = await prisma.payroll.update({
      where: { id },
      data: { ...data, netSalary, ...(data.paymentDate && { paymentDate: new Date(data.paymentDate) }) },
      include: { employee: { select: { id: true, name: true, avatar: true, department: true, title: true } } },
    });
    await audit(actorId, actorEmail, actorRole, 'update', 'Payroll', id, {
      before: { basicSalary: pr.basicSalary, bonus: pr.bonus, allowances: pr.allowances, deductions: pr.deductions },
      after:  { basicSalary: after.basicSalary, bonus: after.bonus, allowances: after.allowances, deductions: after.deductions, netSalary: after.netSalary },
    });
    return after;
  });
}

export async function markPayrollPaid(id: string, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const pr = await prisma.payroll.findFirst({ where: { id, deletedAt: null } });
    if (!pr) throw new AppError('Payroll record not found', 404);
    const after = await prisma.payroll.update({
      where: { id },
      data: { status: 'paid', paymentDate: new Date() },
      include: { employee: { select: { id: true, name: true, avatar: true, department: true, title: true } } },
    });
    await audit(actorId, actorEmail, actorRole, 'mark_paid', 'Payroll', id, { before: { status: pr.status }, after: { status: 'paid' } });
    return after;
  });
}

export async function deletePayroll(id: string) {
  return r(() => prisma.payroll.update({ where: { id }, data: { deletedAt: new Date() } }));
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export async function listBudgets(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const { status, department } = query;
    const where: Prisma.BudgetWhereInput = {
      deletedAt: null,
      ...(status && { status: status as BudgetStatus }),
      ...(department && { department: { contains: department, mode: 'insensitive' } }),
    };
    const [data, total] = await Promise.all([
      prisma.budget.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.budget.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

export async function createBudget(data: any, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    // used/remaining are calculated — strip from input, always start at 0
    const { used: _used, remaining: _remaining, ...safeData } = data;
    const b = await prisma.budget.create({
      data: { ...safeData, used: 0, remaining: safeData.allocated ?? 0, startDate: new Date(safeData.startDate), endDate: new Date(safeData.endDate) },
    });
    await audit(actorId, actorEmail, actorRole, 'create', 'Budget', b.id, { after: b });
    return b;
  });
}

export async function updateBudget(id: string, data: any, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const before = await prisma.budget.findFirst({ where: { id, deletedAt: null } });
    if (!before) throw new AppError('Budget not found', 404);
    // Strip calculated fields — used/remaining are never manually editable
    const { used: _used, remaining: _remaining, ...safeData } = data;
    const allocated = safeData.allocated ?? before.allocated;
    const currentUsed = before.used; // preserve existing used value
    const after = await prisma.budget.update({
      where: { id },
      data: {
        ...safeData,
        remaining: allocated - currentUsed,
        ...(safeData.startDate && { startDate: new Date(safeData.startDate) }),
        ...(safeData.endDate   && { endDate:   new Date(safeData.endDate) }),
      },
    });
    await audit(actorId, actorEmail, actorRole, 'update', 'Budget', id, { before, after });
    return after;
  });
}

export async function deleteBudget(id: string, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const b = await prisma.budget.findFirst({ where: { id, deletedAt: null } });
    if (!b) throw new AppError('Budget not found', 404);
    await audit(actorId, actorEmail, actorRole, 'delete', 'Budget', id, { before: b });
    return prisma.budget.update({ where: { id }, data: { deletedAt: new Date() } });
  });
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export async function audit(
  userId: string,
  userEmail: string,
  roleAtAction: string,
  action: AuditAction,
  resource: string,
  resourceId: string,
  changes?: { before?: any; after?: any },
) {
  return prisma.auditLog.create({
    data: { userId, userEmail, roleAtAction, action, resource, resourceId, changes: changes ?? Prisma.JsonNull },
  });
}

export async function getAuditLog(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const { resource, userId, action } = query;
    const where: Prisma.AuditLogWhereInput = {
      ...(resource && { resource }),
      ...(userId  && { userId }),
      ...(action  && { action: action as AuditAction }),
    };
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.auditLog.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

// ─── Taxes ────────────────────────────────────────────────────────────────────

export async function listTaxes(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const { status, taxType, search } = query;
    const where: Prisma.TaxRecordWhereInput = {
      deletedAt: null,
      ...(status  && { status: status as TaxStatus }),
      ...(taxType && { taxType }),
      ...(search  && { period: { contains: search, mode: 'insensitive' } }),
    };
    const [data, total] = await Promise.all([
      prisma.taxRecord.findMany({ where, skip, take: limit, orderBy: { dueDate: 'asc' } }),
      prisma.taxRecord.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

export async function getTaxSummary() {
  return r(async () => {
    const [all, upcoming, byStatus] = await Promise.all([
      prisma.taxRecord.aggregate({ where: { deletedAt: null }, _sum: { taxAmount: true, taxableAmount: true } }),
      prisma.taxRecord.findMany({
        where: { deletedAt: null, status: { not: 'paid' }, dueDate: { gte: new Date() } },
        orderBy: { dueDate: 'asc' }, take: 5,
      }),
      prisma.taxRecord.groupBy({
        by: ['status'], where: { deletedAt: null },
        _sum: { taxAmount: true }, _count: true,
      }),
    ]);
    return {
      totalLiability: all._sum.taxAmount ?? 0,
      totalTaxable:   all._sum.taxableAmount ?? 0,
      upcomingDueDates: upcoming,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count, total: s._sum.taxAmount ?? 0 })),
    };
  });
}

export async function createTax(data: any, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const tax = await prisma.taxRecord.create({
      data: {
        ...data,
        createdById: actorId,
        dueDate:   new Date(data.dueDate),
        filedDate: data.filedDate ? new Date(data.filedDate) : undefined,
      },
    });
    await audit(actorId, actorEmail, actorRole, 'create', 'TaxRecord', tax.id, { after: tax });
    return tax;
  });
}

export async function updateTax(id: string, data: any, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const before = await prisma.taxRecord.findFirst({ where: { id, deletedAt: null } });
    if (!before) throw new AppError('Tax record not found', 404);
    const after = await prisma.taxRecord.update({
      where: { id },
      data: {
        ...data,
        ...(data.dueDate   && { dueDate:   new Date(data.dueDate) }),
        ...(data.filedDate && { filedDate: new Date(data.filedDate) }),
      },
    });
    await audit(actorId, actorEmail, actorRole, 'update', 'TaxRecord', id, { before, after });
    return after;
  });
}

export async function deleteTax(id: string, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const before = await prisma.taxRecord.findFirst({ where: { id, deletedAt: null } });
    if (!before) throw new AppError('Tax record not found', 404);
    await audit(actorId, actorEmail, actorRole, 'delete', 'TaxRecord', id, { before });
    return prisma.taxRecord.update({ where: { id }, data: { deletedAt: new Date() } });
  });
}

// ─── Investments ──────────────────────────────────────────────────────────────

export async function listInvestments(query: any) {
  return r(async () => {
    const { page, limit, skip } = getPagination(query);
    const { status, investmentType } = query;
    const where: Prisma.InvestmentWhereInput = {
      deletedAt: null,
      ...(status         && { status: status as InvestmentStatus }),
      ...(investmentType && { investmentType }),
    };
    const [data, total] = await Promise.all([
      prisma.investment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.investment.count({ where }),
    ]);
    return paginatedResponse(data, total, { page, limit, skip });
  });
}

export async function getInvestmentSummary() {
  return r(async () => {
    const [agg, active, byType] = await Promise.all([
      prisma.investment.aggregate({
        where: { deletedAt: null },
        _sum: { amountInvested: true, currentValue: true, returns: true },
      }),
      prisma.investment.count({ where: { deletedAt: null, status: 'active' } }),
      prisma.investment.groupBy({
        by: ['investmentType'], where: { deletedAt: null },
        _sum: { amountInvested: true, currentValue: true },
        _count: true,
      }),
    ]);
    return {
      totalInvested:  agg._sum.amountInvested ?? 0,
      currentValue:   agg._sum.currentValue  ?? 0,
      totalReturns:   agg._sum.returns        ?? 0,
      activeCount:    active,
      byType: byType.map(t => ({
        type:     t.investmentType,
        count:    t._count,
        invested: t._sum.amountInvested ?? 0,
        value:    t._sum.currentValue   ?? 0,
      })),
    };
  });
}

export async function createInvestment(data: any, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const inv = await prisma.investment.create({
      data: {
        ...data,
        createdById:  actorId,
        startDate:    new Date(data.startDate),
        maturityDate: data.maturityDate ? new Date(data.maturityDate) : undefined,
      },
    });
    await audit(actorId, actorEmail, actorRole, 'create', 'Investment', inv.id, { after: inv });
    return inv;
  });
}

export async function updateInvestment(id: string, data: any, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const before = await prisma.investment.findFirst({ where: { id, deletedAt: null } });
    if (!before) throw new AppError('Investment not found', 404);
    const after = await prisma.investment.update({
      where: { id },
      data: {
        ...data,
        ...(data.startDate    && { startDate:    new Date(data.startDate) }),
        ...(data.maturityDate && { maturityDate: new Date(data.maturityDate) }),
      },
    });
    await audit(actorId, actorEmail, actorRole, 'update', 'Investment', id, { before, after });
    return after;
  });
}

export async function deleteInvestment(id: string, actorId: string, actorEmail: string, actorRole: string) {
  return r(async () => {
    const before = await prisma.investment.findFirst({ where: { id, deletedAt: null } });
    if (!before) throw new AppError('Investment not found', 404);
    await audit(actorId, actorEmail, actorRole, 'delete', 'Investment', id, { before });
    return prisma.investment.update({ where: { id }, data: { deletedAt: new Date() } });
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function getReportSummary(query: any) {
  return r(async () => {
    const { dateFrom, dateTo, year } = query;
    const y = parseInt(year) || new Date().getFullYear();

    const dateFilter = (field: string) => ({
      ...(dateFrom && { [field]: { gte: new Date(dateFrom) } }),
      ...(dateTo && { [field]: { lte: new Date(dateTo) } }),
    });

    const [revenue, expenses, payroll, budgets, monthly] = await Promise.all([
      prisma.invoice.aggregate({ where: { status: 'paid', deletedAt: null, ...dateFilter('issueDate') }, _sum: { grandTotal: true }, _count: true }),
      prisma.expense.aggregate({ where: { status: { in: ['approved', 'paid'] }, deletedAt: null, ...dateFilter('expenseDate') }, _sum: { amount: true }, _count: true }),
      prisma.payroll.aggregate({ where: { status: 'paid', deletedAt: null }, _sum: { netSalary: true }, _count: true }),
      prisma.budget.findMany({ where: { deletedAt: null } }),
      getMonthlyAnalytics(y),
    ]);

    const totalRevenue = revenue._sum.grandTotal ?? 0;
    const totalExpenses = (expenses._sum.amount ?? 0) + (payroll._sum.netSalary ?? 0);

    return {
      revenue: { total: totalRevenue, count: revenue._count },
      expenses: { total: expenses._sum.amount ?? 0, count: expenses._count },
      payroll: { total: payroll._sum.netSalary ?? 0, count: payroll._count },
      profit: totalRevenue - totalExpenses,
      budgets,
      monthly,
    };
  });
}
