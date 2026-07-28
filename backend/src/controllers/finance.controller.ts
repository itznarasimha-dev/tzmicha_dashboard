import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { catchAsync } from '../utils/AppError';
import * as svc from '../services/finance.service';

const ok = (res: Response, data: any, status = 200) =>
  res.status(status).json({ success: true, data });

// ─── Opening Balance ──────────────────────────────────────────────────────────
export const getOpeningBalance = catchAsync(async (_req: AuthRequest, res: Response) => {
  ok(res, await svc.getOpeningBalance());
});
export const setOpeningBalance = catchAsync(async (req: AuthRequest, res: Response) => {
  const result = await svc.setOpeningBalance(parseFloat(req.body.amount));
  await svc.audit(req.user!.id, req.user!.email, req.user!.role, 'update', 'OpeningBalance', result.id, { after: { amount: result.amount } });
  ok(res, result);
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboard = catchAsync(async (req: AuthRequest, res: Response) => {
  const period = (req.query.period as string) || 'month';
  ok(res, await svc.getDashboardSummary(period as any));
});
export const getMonthlyAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.getMonthlyAnalytics(parseInt(req.query.year as string) || new Date().getFullYear()));
});
export const getExpenseBreakdown = catchAsync(async (_req: AuthRequest, res: Response) => {
  ok(res, await svc.getExpenseCategoryBreakdown());
});

// ─── Clients ──────────────────────────────────────────────────────────────────
export const listClients = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.listClients(req.query));
});
export const createClient = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.createClient(req.body), 201);
});
export const updateClient = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.updateClient(req.params.id, req.body));
});
export const deleteClient = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteClient(req.params.id);
  res.status(204).send();
});

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const listInvoices = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.listInvoices(req.query));
});
export const getInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.getInvoiceById(req.params.id));
});
export const createInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.createInvoice(req.body, req.user!.id), 201);
});
export const updateInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.updateInvoice(req.params.id, req.body));
});
export const deleteInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteInvoice(req.params.id);
  res.status(204).send();
});
export const duplicateInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.duplicateInvoice(req.params.id, req.user!.id), 201);
});
export const markInvoicePaid = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.markInvoicePaid(req.params.id));
});
export const sendInvoice = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.sendInvoice(req.params.id));
});
export const bulkDeleteInvoices = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.bulkDeleteInvoices(req.body.ids));
});
export const bulkSendReminder = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.bulkSendReminder(req.body.ids));
});

// ─── Payments ─────────────────────────────────────────────────────────────────
export const listPayments = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.listPayments(req.query));
});
export const createPayment = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.createPayment(req.body), 201);
});
export const updatePayment = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.updatePayment(req.params.id, req.body));
});
export const deletePayment = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deletePayment(req.params.id);
  res.status(204).send();
});

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const getExpenseStats = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.getExpenseStats(req.query));
});
export const listExpenses = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.listExpenses(req.query));
});
export const createExpense = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.createExpense({ ...req.body, submittedById: req.user!.id }), 201);
});
export const updateExpense = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.updateExpense(req.params.id, req.body));
});
export const deleteExpense = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteExpense(req.params.id);
  res.status(204).send();
});
export const generateNextExpenseOccurrence = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.generateNextExpenseOccurrence(req.params.id), 201);
});
export const approveExpense = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.approveExpense(req.params.id, req.user!.id, req.user!.email, req.user!.role));
});
export const rejectExpense = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.rejectExpense(req.params.id, req.user!.id, req.user!.email, req.user!.role));
});

// ─── Payroll ──────────────────────────────────────────────────────────────────
export const listPayroll = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.listPayroll(req.query));
});
export const createPayroll = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.createPayroll(req.body, req.user!.id, req.user!.email, req.user!.role), 201);
});
export const updatePayroll = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.updatePayroll(req.params.id, req.body, req.user!.id, req.user!.email, req.user!.role));
});
export const deletePayroll = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deletePayroll(req.params.id);
  res.status(204).send();
});
export const markPayrollPaid = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.markPayrollPaid(req.params.id, req.user!.id, req.user!.email, req.user!.role));
});

// ─── Budgets ──────────────────────────────────────────────────────────────────
export const listBudgets = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.listBudgets(req.query));
});
export const createBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.createBudget(req.body, req.user!.id, req.user!.email, req.user!.role), 201);
});
export const updateBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.updateBudget(req.params.id, req.body, req.user!.id, req.user!.email, req.user!.role));
});
export const deleteBudget = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteBudget(req.params.id, req.user!.id, req.user!.email, req.user!.role);
  res.status(204).send();
});

// ─── Taxes ────────────────────────────────────────────────────────────────────
export const listTaxes = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.listTaxes(req.query));
});
export const getTaxSummary = catchAsync(async (_req: AuthRequest, res: Response) => {
  ok(res, await svc.getTaxSummary());
});
export const createTax = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.createTax(req.body, req.user!.id, req.user!.email, req.user!.role), 201);
});
export const updateTax = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.updateTax(req.params.id, req.body, req.user!.id, req.user!.email, req.user!.role));
});
export const deleteTax = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteTax(req.params.id, req.user!.id, req.user!.email, req.user!.role);
  res.status(204).send();
});

// ─── Investments ──────────────────────────────────────────────────────────────
export const listInvestments = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.listInvestments(req.query));
});
export const getInvestmentSummary = catchAsync(async (_req: AuthRequest, res: Response) => {
  ok(res, await svc.getInvestmentSummary());
});
export const createInvestment = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.createInvestment(req.body, req.user!.id, req.user!.email, req.user!.role), 201);
});
export const updateInvestment = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.updateInvestment(req.params.id, req.body, req.user!.id, req.user!.email, req.user!.role));
});
export const deleteInvestment = catchAsync(async (req: AuthRequest, res: Response) => {
  await svc.deleteInvestment(req.params.id, req.user!.id, req.user!.email, req.user!.role);
  res.status(204).send();
});

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const getAuditLog = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.getAuditLog(req.query));
});

// ─── Reports ──────────────────────────────────────────────────────────────────
export const getReports = catchAsync(async (req: AuthRequest, res: Response) => {
  ok(res, await svc.getReportSummary(req.query));
});
