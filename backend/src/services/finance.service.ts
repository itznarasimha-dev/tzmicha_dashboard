import { prisma, withRetry } from '../config/prisma';
import { AppError } from '../utils/AppError';
import { getPagination, paginatedResponse } from '../utils/pagination';
import {
  InvoiceStatus, PaymentStatus, ExpenseStatus, PayrollStatus, BudgetStatus,
  Prisma,
} from '@prisma/client';

// ─── Opening Balance ──────────────────────────────────────────────────────────

export async function getOpeningBalance() {
  let ob = await prisma.financeOpeningBalance.findFirst();
  if (!ob) ob = await prisma.financeOpeningBalance.create({ data: { amount: 0 } });
  return ob;
}

export async function setOpeningBalance(amount: number) {
  const ob = await prisma.financeOpeningBalance.findFirst();
  if (ob) return prisma.financeOpeningBalance.update({ where: { id: ob.id }, data: { amount } });
  return prisma.financeOpeningBalance.create({ data: { amount } });
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export async function getDashboardSummary() {
  return withRetry(async () => {
  const [ob, paidInvoices, receivedPayments, approvedExpenses, paidPayroll, pendingInvoices, budgets] =
    await Promise.all([
      getOpeningBalance(),
      prisma.invoice.aggregate({ where: { status: 'paid', deletedAt: null }, _sum: { grandTotal: true } }),
      prisma.payment.aggregate({ where: { status: 'received', deletedAt: null }, _sum: { amount: true } }),
      prisma.expense.aggregate({ where: { status: { in: ['approved', 'paid'] }, deletedAt: null }, _sum: { amount: true } }),
      prisma.payroll.aggregate({ where: { status: 'paid', deletedAt: null }, _sum: { netSalary: true } }),
      prisma.invoice.aggregate({ where: { status: { in: ['sent', 'viewed', 'overdue'] }, deletedAt: null }, _sum: { grandTotal: true }, _count: true }),
      prisma.budget.findMany({ where: { status: 'active', deletedAt: null } }),
    ]);

  const revenue = paidInvoices._sum.grandTotal ?? 0;
  const totalExpenses = (approvedExpenses._sum.amount ?? 0) + (paidPayroll._sum.netSalary ?? 0);
  const netProfit = revenue - totalExpenses;
  const currentBalance = ob.amount + (receivedPayments._sum.amount ?? 0) - (approvedExpenses._sum.amount ?? 0) - (paidPayroll._sum.netSalary ?? 0);

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
    currentBalance, revenue, totalExpenses, netProfit,
    pendingInvoiceAmount: pendingInvoices._sum.grandTotal ?? 0,
    pendingInvoiceCount: pendingInvoices._count,
    monthlyPayroll: monthlyPayroll._sum.netSalary ?? 0,
    activeBudgets: budgets.length,
    recentInvoices, recentPayments, recentExpenses, recentPayroll,
  };
  });
}

// ─── Monthly Analytics ────────────────────────────────────────────────────────

export async function getMonthlyAnalytics(year: number) {
  return withRetry(async () => {
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
  const result = await withRetry(() => prisma.expense.groupBy({
    by: ['category'],
    where: { status: { in: ['approved', 'paid'] }, deletedAt: null },
    _sum: { amount: true },
  }));
  return result.map(r => ({ category: r.category, total: r._sum.amount ?? 0 }));
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function listClients(query: any) {
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
}

export async function createClient(data: any) {
  return prisma.financeClient.create({ data });
}

export async function updateClient(id: string, data: any) {
  return prisma.financeClient.update({ where: { id }, data });
}

export async function deleteClient(id: string) {
  return prisma.financeClient.update({ where: { id }, data: { deletedAt: new Date() } });
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

async function generateInvoiceNumber(): Promise<string> {
  const last = await prisma.invoice.findFirst({ orderBy: { createdAt: 'desc' }, select: { invoiceNumber: true } });
  const lastNum = last ? parseInt(last.invoiceNumber.replace('INV-', ''), 10) : 1000;
  return `INV-${String(lastNum + 1).padStart(4, '0')}`;
}

export async function listInvoices(query: any) {
  const { page, limit, skip } = getPagination(query);
  const { search, status, clientId, dateFrom, dateTo } = query;
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
  const [data, total] = await Promise.all([
    prisma.invoice.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { client: true, items: true, _count: { select: { payments: true } } },
    }),
    prisma.invoice.count({ where }),
  ]);
  return paginatedResponse(data, total, { page, limit, skip });
}

export async function getInvoiceById(id: string) {
  const inv = await prisma.invoice.findFirst({
    where: { id, deletedAt: null },
    include: { client: true, items: true, payments: true },
  });
  if (!inv) throw new AppError('Invoice not found', 404);
  return inv;
}

export async function createInvoice(data: any, createdById: string) {
  const { items, clientId, project, discount, tax, notes, dueDate, status } = data;
  const invoiceNumber = await generateInvoiceNumber();
  const subtotal = items.reduce((s: number, i: any) => s + i.qty * i.price, 0);
  const grandTotal = subtotal - (discount ?? 0) + (tax ?? 0);

  return prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId,
      project,
      subtotal,
      discount: discount ?? 0,
      tax: tax ?? 0,
      grandTotal,
      dueDate: new Date(dueDate),
      status: status ?? 'draft',
      notes,
      createdById,
      items: { create: items.map((i: any) => ({ item: i.item, description: i.description, qty: i.qty, price: i.price, amount: i.qty * i.price })) },
    },
    include: { client: true, items: true },
  });
}

export async function updateInvoice(id: string, data: any) {
  const { items, discount, tax, ...rest } = data;
  const inv = await prisma.invoice.findFirst({ where: { id, deletedAt: null } });
  if (!inv) throw new AppError('Invoice not found', 404);

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
  if (rest.dueDate) updateData.dueDate = new Date(rest.dueDate);
  return prisma.invoice.update({ where: { id }, data: updateData, include: { client: true, items: true } });
}

export async function deleteInvoice(id: string) {
  return prisma.invoice.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function duplicateInvoice(id: string, createdById: string) {
  const original = await getInvoiceById(id);
  const invoiceNumber = await generateInvoiceNumber();
  return prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: original.clientId,
      project: original.project,
      subtotal: original.subtotal,
      discount: original.discount,
      tax: original.tax,
      grandTotal: original.grandTotal,
      dueDate: original.dueDate,
      status: 'draft',
      notes: original.notes,
      createdById,
      items: { create: original.items.map(i => ({ item: i.item, description: i.description, qty: i.qty, price: i.price, amount: i.amount })) },
    },
    include: { client: true, items: true },
  });
}

export async function markInvoicePaid(id: string) {
  return prisma.invoice.update({ where: { id }, data: { status: 'paid' } });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function listPayments(query: any) {
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
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { invoice: { include: { client: true } } },
    }),
    prisma.payment.count({ where }),
  ]);
  return paginatedResponse(data, total, { page, limit, skip });
}

export async function createPayment(data: any) {
  const payment = await prisma.payment.create({ data: { ...data, paymentDate: new Date(data.paymentDate) }, include: { invoice: { include: { client: true } } } });
  // If received, update invoice status and balance
  if (data.status === 'received' && data.invoiceId) {
    await prisma.invoice.update({ where: { id: data.invoiceId }, data: { status: 'paid' } });
  }
  return payment;
}

export async function updatePayment(id: string, data: any) {
  const prev = await prisma.payment.findFirst({ where: { id, deletedAt: null } });
  if (!prev) throw new AppError('Payment not found', 404);
  const payment = await prisma.payment.update({
    where: { id },
    data: { ...data, ...(data.paymentDate && { paymentDate: new Date(data.paymentDate) }) },
    include: { invoice: { include: { client: true } } },
  });
  // If status changed to received, update invoice
  if (data.status === 'received' && prev.status !== 'received' && payment.invoiceId) {
    await prisma.invoice.update({ where: { id: payment.invoiceId }, data: { status: 'paid' } });
  }
  return payment;
}

export async function deletePayment(id: string) {
  return prisma.payment.update({ where: { id }, data: { deletedAt: new Date() } });
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export async function listExpenses(query: any) {
  const { page, limit, skip } = getPagination(query);
  const { search, status, category, dateFrom, dateTo } = query;
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
  const [data, total] = await Promise.all([
    prisma.expense.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.expense.count({ where }),
  ]);
  return paginatedResponse(data, total, { page, limit, skip });
}

export async function createExpense(data: any) {
  return prisma.expense.create({ data: { ...data, expenseDate: new Date(data.expenseDate) } });
}

export async function updateExpense(id: string, data: any) {
  const exp = await prisma.expense.findFirst({ where: { id, deletedAt: null } });
  if (!exp) throw new AppError('Expense not found', 404);
  return prisma.expense.update({
    where: { id },
    data: { ...data, ...(data.expenseDate && { expenseDate: new Date(data.expenseDate) }) },
  });
}

export async function deleteExpense(id: string) {
  return prisma.expense.update({ where: { id }, data: { deletedAt: new Date() } });
}

// ─── Payroll ──────────────────────────────────────────────────────────────────

export async function listPayroll(query: any) {
  const { page, limit, skip } = getPagination(query);
  const { search, status, month } = query;
  const where: Prisma.PayrollWhereInput = {
    deletedAt: null,
    ...(status && { status: status as PayrollStatus }),
    ...(month && { month: { startsWith: month } }),
    ...(search && {
      employee: { name: { contains: search, mode: 'insensitive' } },
    }),
  };
  const [data, total] = await Promise.all([
    prisma.payroll.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { id: true, name: true, avatar: true, department: true, title: true } } },
    }),
    prisma.payroll.count({ where }),
  ]);
  return paginatedResponse(data, total, { page, limit, skip });
}

export async function createPayroll(data: any) {
  const netSalary = (data.basicSalary ?? 0) + (data.bonus ?? 0) + (data.allowances ?? 0) - (data.deductions ?? 0);
  return prisma.payroll.create({
    data: { ...data, netSalary, ...(data.paymentDate && { paymentDate: new Date(data.paymentDate) }) },
    include: { employee: { select: { id: true, name: true, avatar: true, department: true, title: true } } },
  });
}

export async function updatePayroll(id: string, data: any) {
  const pr = await prisma.payroll.findFirst({ where: { id, deletedAt: null } });
  if (!pr) throw new AppError('Payroll record not found', 404);
  const netSalary = ((data.basicSalary ?? pr.basicSalary) + (data.bonus ?? pr.bonus) + (data.allowances ?? pr.allowances) - (data.deductions ?? pr.deductions));
  return prisma.payroll.update({
    where: { id },
    data: { ...data, netSalary, ...(data.paymentDate && { paymentDate: new Date(data.paymentDate) }) },
    include: { employee: { select: { id: true, name: true, avatar: true, department: true, title: true } } },
  });
}

export async function deletePayroll(id: string) {
  return prisma.payroll.update({ where: { id }, data: { deletedAt: new Date() } });
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export async function listBudgets(query: any) {
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
}

export async function createBudget(data: any) {
  const remaining = (data.allocated ?? 0) - (data.used ?? 0);
  return prisma.budget.create({
    data: { ...data, remaining, startDate: new Date(data.startDate), endDate: new Date(data.endDate) },
  });
}

export async function updateBudget(id: string, data: any) {
  const b = await prisma.budget.findFirst({ where: { id, deletedAt: null } });
  if (!b) throw new AppError('Budget not found', 404);
  const allocated = data.allocated ?? b.allocated;
  const used = data.used ?? b.used;
  const remaining = allocated - used;
  return prisma.budget.update({
    where: { id },
    data: {
      ...data, remaining,
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    },
  });
}

export async function deleteBudget(id: string) {
  return prisma.budget.update({ where: { id }, data: { deletedAt: new Date() } });
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function getReportSummary(query: any) {
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
}
