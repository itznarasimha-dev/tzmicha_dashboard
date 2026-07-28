import { Router } from 'express';
import { authenticate, authorize, authorizeAdminOnly } from '../middleware/auth';
import * as ctrl from '../controllers/finance.controller';

export const financeRouter = Router();

// Middleware stacks
const financeAuth = [authenticate, authorize('admin', 'finance' as any)];
const adminAuth   = [authenticate, authorize('admin' as any)];

// ── Dashboard (both roles) ────────────────────────────────────────────────────
financeRouter.get('/dashboard',          ...financeAuth, ctrl.getDashboard);
financeRouter.get('/analytics/monthly',  ...financeAuth, ctrl.getMonthlyAnalytics);
financeRouter.get('/analytics/expenses', ...financeAuth, ctrl.getExpenseBreakdown);

// ── Opening Balance (admin only) ──────────────────────────────────────────────
financeRouter.get('/opening-balance',    ...adminAuth, ctrl.getOpeningBalance);
financeRouter.put('/opening-balance',    ...adminAuth, ctrl.setOpeningBalance);

// ── Clients (both roles) ──────────────────────────────────────────────────────
financeRouter.get('/clients',            ...financeAuth, ctrl.listClients);
financeRouter.post('/clients',           ...financeAuth, ctrl.createClient);
financeRouter.patch('/clients/:id',      ...financeAuth, ctrl.updateClient);
financeRouter.delete('/clients/:id',     ...financeAuth, ctrl.deleteClient);

// ── Invoices (both roles) ─────────────────────────────────────────────────────
// NOTE: bulk routes must be before /:id to avoid param conflicts
financeRouter.post('/invoices/bulk-delete',       ...financeAuth, ctrl.bulkDeleteInvoices);
financeRouter.post('/invoices/bulk-remind',       ...financeAuth, ctrl.bulkSendReminder);
financeRouter.get('/invoices',                    ...financeAuth, ctrl.listInvoices);
financeRouter.get('/invoices/:id',                ...financeAuth, ctrl.getInvoice);
financeRouter.post('/invoices',                   ...financeAuth, ctrl.createInvoice);
financeRouter.patch('/invoices/:id',              ...financeAuth, ctrl.updateInvoice);
financeRouter.delete('/invoices/:id',             ...financeAuth, ctrl.deleteInvoice);
financeRouter.post('/invoices/:id/duplicate',     ...financeAuth, ctrl.duplicateInvoice);
financeRouter.patch('/invoices/:id/mark-paid',    ...financeAuth, ctrl.markInvoicePaid);
financeRouter.post('/invoices/:id/send',          ...financeAuth, ctrl.sendInvoice);

// ── Payments (both roles) ─────────────────────────────────────────────────────
financeRouter.get('/payments',           ...financeAuth, ctrl.listPayments);
financeRouter.post('/payments',          ...financeAuth, ctrl.createPayment);
financeRouter.patch('/payments/:id',     ...financeAuth, ctrl.updatePayment);
financeRouter.delete('/payments/:id',    ...financeAuth, ctrl.deletePayment);

// ── Expenses ──────────────────────────────────────────────────────────────────
// Stats must be before /:id to avoid param conflict
financeRouter.get('/expenses/stats',         ...financeAuth, ctrl.getExpenseStats);
// Approve / Reject — admin only (separate routes, enforced at API level)
financeRouter.patch('/expenses/:id/approve', ...adminAuth, ctrl.approveExpense);
financeRouter.patch('/expenses/:id/reject',  ...adminAuth, ctrl.rejectExpense);
// General CRUD — both roles
financeRouter.get('/expenses',               ...financeAuth, ctrl.listExpenses);
financeRouter.post('/expenses',              ...financeAuth, ctrl.createExpense);
financeRouter.patch('/expenses/:id',         ...financeAuth, ctrl.updateExpense);
financeRouter.delete('/expenses/:id',        ...financeAuth, ctrl.deleteExpense);
financeRouter.post('/expenses/:id/next-occurrence', ...financeAuth, ctrl.generateNextExpenseOccurrence);

// ── Payroll ───────────────────────────────────────────────────────────────────
// Mark paid — finance can do this
financeRouter.patch('/payroll/:id/mark-paid', ...financeAuth, ctrl.markPayrollPaid);
// Create / edit salary fields / delete — admin only
financeRouter.post('/payroll',               ...adminAuth, ctrl.createPayroll);
financeRouter.patch('/payroll/:id',          ...adminAuth, ctrl.updatePayroll);
financeRouter.delete('/payroll/:id',         ...adminAuth, ctrl.deletePayroll);
// List / view — both roles
financeRouter.get('/payroll',                ...financeAuth, ctrl.listPayroll);

// ── Budgets — view: both roles; mutate: admin only ──────────────────────────
financeRouter.get('/budgets',            ...financeAuth, ctrl.listBudgets);
financeRouter.post('/budgets',           ...adminAuth, ctrl.createBudget);
financeRouter.patch('/budgets/:id',      ...adminAuth, ctrl.updateBudget);
financeRouter.delete('/budgets/:id',     ...adminAuth, ctrl.deleteBudget);

// ── Taxes (admin only) ────────────────────────────────────────────────────────
financeRouter.get('/taxes',              ...adminAuth, ctrl.listTaxes);
financeRouter.get('/taxes/summary',      ...adminAuth, ctrl.getTaxSummary);
financeRouter.post('/taxes',             ...adminAuth, ctrl.createTax);
financeRouter.patch('/taxes/:id',        ...adminAuth, ctrl.updateTax);
financeRouter.delete('/taxes/:id',       ...adminAuth, ctrl.deleteTax);

// ── Investments (admin only) ──────────────────────────────────────────────────
financeRouter.get('/investments',        ...adminAuth, ctrl.listInvestments);
financeRouter.get('/investments/summary',...adminAuth, ctrl.getInvestmentSummary);
financeRouter.post('/investments',       ...adminAuth, ctrl.createInvestment);
financeRouter.patch('/investments/:id',  ...adminAuth, ctrl.updateInvestment);
financeRouter.delete('/investments/:id', ...adminAuth, ctrl.deleteInvestment);

// ── Reports ───────────────────────────────────────────────────────────────────
financeRouter.get('/reports',            ...financeAuth, ctrl.getReports);

// ── Audit Log (admin only) ────────────────────────────────────────────────────
financeRouter.get('/audit-log',          ...adminAuth, ctrl.getAuditLog);
