import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as ctrl from '../controllers/finance.controller';

export const financeRouter = Router();

const financeRoles = ['admin', 'finance'] as any[];
const auth = [authenticate, authorize(...financeRoles)];

// Dashboard
financeRouter.get('/dashboard',           ...auth, ctrl.getDashboard);
financeRouter.get('/analytics/monthly',   ...auth, ctrl.getMonthlyAnalytics);
financeRouter.get('/analytics/expenses',  ...auth, ctrl.getExpenseBreakdown);

// Opening Balance
financeRouter.get('/opening-balance',     ...auth, ctrl.getOpeningBalance);
financeRouter.put('/opening-balance',     ...auth, ctrl.setOpeningBalance);

// Clients
financeRouter.get('/clients',             ...auth, ctrl.listClients);
financeRouter.post('/clients',            ...auth, ctrl.createClient);
financeRouter.patch('/clients/:id',       ...auth, ctrl.updateClient);
financeRouter.delete('/clients/:id',      ...auth, ctrl.deleteClient);

// Invoices
financeRouter.get('/invoices',            ...auth, ctrl.listInvoices);
financeRouter.get('/invoices/:id',        ...auth, ctrl.getInvoice);
financeRouter.post('/invoices',           ...auth, ctrl.createInvoice);
financeRouter.patch('/invoices/:id',      ...auth, ctrl.updateInvoice);
financeRouter.delete('/invoices/:id',     ...auth, ctrl.deleteInvoice);
financeRouter.post('/invoices/:id/duplicate', ...auth, ctrl.duplicateInvoice);
financeRouter.patch('/invoices/:id/mark-paid', ...auth, ctrl.markInvoicePaid);

// Payments
financeRouter.get('/payments',            ...auth, ctrl.listPayments);
financeRouter.post('/payments',           ...auth, ctrl.createPayment);
financeRouter.patch('/payments/:id',      ...auth, ctrl.updatePayment);
financeRouter.delete('/payments/:id',     ...auth, ctrl.deletePayment);

// Expenses
financeRouter.get('/expenses',            ...auth, ctrl.listExpenses);
financeRouter.post('/expenses',           ...auth, ctrl.createExpense);
financeRouter.patch('/expenses/:id',      ...auth, ctrl.updateExpense);
financeRouter.delete('/expenses/:id',     ...auth, ctrl.deleteExpense);

// Payroll
financeRouter.get('/payroll',             ...auth, ctrl.listPayroll);
financeRouter.post('/payroll',            ...auth, ctrl.createPayroll);
financeRouter.patch('/payroll/:id',       ...auth, ctrl.updatePayroll);
financeRouter.delete('/payroll/:id',      ...auth, ctrl.deletePayroll);

// Budgets
financeRouter.get('/budgets',             ...auth, ctrl.listBudgets);
financeRouter.post('/budgets',            ...auth, ctrl.createBudget);
financeRouter.patch('/budgets/:id',       ...auth, ctrl.updateBudget);
financeRouter.delete('/budgets/:id',      ...auth, ctrl.deleteBudget);

// Reports
financeRouter.get('/reports',             ...auth, ctrl.getReports);
