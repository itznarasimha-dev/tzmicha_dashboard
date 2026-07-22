import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  usersApi, projectsApi, tasksApi, sprintsApi, workUpdatesApi,
  leaveApi, attendanceApi, campaignsApi, dealsApi, roadmapApi,
  notificationsApi, activityApi, recruitmentApi, calendarApi, chatApi, financeApi,
} from '@/services';

// ── Users ─────────────────────────────────────────────────────────────────────
export function useUsers(params?: Record<string, any>) {
  return useQuery({ queryKey: ['users', params], queryFn: () => usersApi.list(params) });
}
export function useUser(id: string) {
  return useQuery({ queryKey: ['users', id], queryFn: () => usersApi.getById(id), enabled: !!id });
}
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

// ── Projects ──────────────────────────────────────────────────────────────────
export function useProjects(params?: Record<string, any>) {
  return useQuery({ queryKey: ['projects', params], queryFn: () => projectsApi.list(params) });
}
export function useProject(id: string) {
  return useQuery({ queryKey: ['projects', id], queryFn: () => projectsApi.getById(id), enabled: !!id });
}
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => projectsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => projectsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}
export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
export function useTasks(params?: Record<string, any>) {
  return useQuery({ queryKey: ['tasks', params], queryFn: () => tasksApi.list(params) });
}
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => tasksApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => tasksApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => tasksApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
export function useApproveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
export function useRequestExtension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => tasksApi.requestExtension(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['extensions'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
export function useExtensionRequests(params?: Record<string, any>) {
  return useQuery({ queryKey: ['extensions', params], queryFn: () => tasksApi.getExtensions(params) });
}
export function useReviewExtension() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'approved' | 'rejected' }) => tasksApi.reviewExtension(id, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['extensions'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

// ── Sprints ───────────────────────────────────────────────────────────────────
export function useSprints(projectId?: string) {
  return useQuery({ queryKey: ['sprints', projectId], queryFn: () => sprintsApi.list(projectId) });
}
export function useSprint(id: string) {
  return useQuery({ queryKey: ['sprints', id], queryFn: () => sprintsApi.getById(id), enabled: !!id });
}
export function useUpdateSprint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => sprintsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sprints'] }),
  });
}

// ── Work Updates ──────────────────────────────────────────────────────────────
export function useWorkUpdates(params?: Record<string, any>) {
  return useQuery({ queryKey: ['work-updates', params], queryFn: () => workUpdatesApi.list(params) });
}
export function useCreateWorkUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => workUpdatesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['work-updates'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// ── Leave ─────────────────────────────────────────────────────────────────────
export function useLeaveRequests(params?: Record<string, any>) {
  return useQuery({ queryKey: ['leave', params], queryFn: () => leaveApi.list(params) });
}
export function useLeaveBalance() {
  return useQuery({ queryKey: ['leave-balance'], queryFn: () => leaveApi.myBalance() });
}
export function useCreateLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => leaveApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leave'] }),
  });
}
export function useUpdateLeaveStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => leaveApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

// ── Attendance ────────────────────────────────────────────────────────────────
export function useAttendance(params?: Record<string, any>) {
  return useQuery({ queryKey: ['attendance', params], queryFn: () => attendanceApi.list(params) });
}

// ── Campaigns ─────────────────────────────────────────────────────────────────
export function useCampaigns(params?: Record<string, any>) {
  return useQuery({ queryKey: ['campaigns', params], queryFn: () => campaignsApi.list(params) });
}
export function useCampaignStats() {
  return useQuery({ queryKey: ['campaign-stats'], queryFn: () => campaignsApi.stats() });
}
export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => campaignsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}
export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => campaignsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}

// ── Deals ─────────────────────────────────────────────────────────────────────
export function useDeals(params?: Record<string, any>) {
  return useQuery({ queryKey: ['deals', params], queryFn: () => dealsApi.list(params) });
}
export function usePipelineStats() {
  return useQuery({ queryKey: ['pipeline-stats'], queryFn: () => dealsApi.stats() });
}
export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => dealsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}
export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => dealsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

// ── Roadmap ───────────────────────────────────────────────────────────────────
export function useRoadmap(params?: Record<string, any>) {
  return useQuery({ queryKey: ['roadmap', params], queryFn: () => roadmapApi.list(params) });
}
export function useCreateRoadmapItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => roadmapApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roadmap'] }),
  });
}
export function useUpdateRoadmapItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => roadmapApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roadmap'] }),
  });
}

// ── Notifications ─────────────────────────────────────────────────────────────
export function useNotifications(params?: Record<string, any>) {
  return useQuery({ queryKey: ['notifications', params], queryFn: () => notificationsApi.list(params) });
}
export function useUnreadCount() {
  return useQuery({ queryKey: ['unread-count'], queryFn: () => notificationsApi.unreadCount(), refetchInterval: 30000 });
}
export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['unread-count'] }); },
  });
}
export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['unread-count'] }); },
  });
}

// ── Activity ──────────────────────────────────────────────────────────────────
export function useActivity(params?: Record<string, any>) {
  return useQuery({ queryKey: ['activity', params], queryFn: () => activityApi.list(params) });
}

// ── Calendar ──────────────────────────────────────────────────────────────────
export function useCalendarEvents(params?: Record<string, any>) {
  return useQuery({ queryKey: ['calendar-events', params], queryFn: () => calendarApi.listEvents(params) });
}
export function useCreateCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => calendarApi.createEvent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-events'] }),
  });
}
export function useUpdateCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => calendarApi.updateEvent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-events'] }),
  });
}
export function useDeleteCalendarEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarApi.deleteEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['calendar-events'] }),
  });
}
export function usePublicHolidays() {
  return useQuery({ queryKey: ['public-holidays'], queryFn: () => calendarApi.listHolidays() });
}
export function useTodayHoliday() {
  return useQuery({ queryKey: ['today-holiday'], queryFn: () => calendarApi.getTodayHoliday(), staleTime: 60 * 60 * 1000 });
}
export function useCreateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => calendarApi.createHoliday(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['public-holidays'] }); qc.invalidateQueries({ queryKey: ['today-holiday'] }); },
  });
}
export function useUpdateHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => calendarApi.updateHoliday(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['public-holidays'] }); qc.invalidateQueries({ queryKey: ['today-holiday'] }); },
  });
}
export function useDeleteHoliday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarApi.deleteHoliday(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['public-holidays'] }); qc.invalidateQueries({ queryKey: ['today-holiday'] }); },
  });
}

// ── Recruitment ───────────────────────────────────────────────────────────────
export function useRecruitmentStats() {
  return useQuery({ queryKey: ['recruitment-stats'], queryFn: () => recruitmentApi.stats() });
}
export function useJobOpenings(params?: Record<string, any>) {
  return useQuery({ queryKey: ['jobs', params], queryFn: () => recruitmentApi.listJobs(params) });
}
export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => recruitmentApi.createJob(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); qc.invalidateQueries({ queryKey: ['recruitment-stats'] }); },
  });
}
export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => recruitmentApi.updateJob(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); qc.invalidateQueries({ queryKey: ['recruitment-stats'] }); },
  });
}
export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.deleteJob(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['jobs'] }); qc.invalidateQueries({ queryKey: ['recruitment-stats'] }); },
  });
}
export function useCandidates(params?: Record<string, any>) {
  return useQuery({ queryKey: ['candidates', params], queryFn: () => recruitmentApi.listCandidates(params), placeholderData: keepPreviousData });
}
export function useCreateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => recruitmentApi.createCandidate(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['candidates'] }); qc.invalidateQueries({ queryKey: ['recruitment-stats'] }); },
  });
}
export function useUpdateCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => recruitmentApi.updateCandidate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidates'] }),
  });
}
export function useUpdateCandidateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => recruitmentApi.updateCandidateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['candidates'] });
      const prev = qc.getQueriesData({ queryKey: ['candidates'] });
      qc.setQueriesData({ queryKey: ['candidates'] }, (old: any) => {
        if (!old?.data) return old;
        return { ...old, data: old.data.map((c: any) => c.id === id ? { ...c, status } : c) };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx: any) => {
      ctx?.prev?.forEach(([key, val]: any) => qc.setQueryData(key, val));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      qc.invalidateQueries({ queryKey: ['recruitment-stats'] });
    },
  });
}
export function useDeleteCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.deleteCandidate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['candidates'] }); qc.invalidateQueries({ queryKey: ['recruitment-stats'] }); },
  });
}
export function useConvertToEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => recruitmentApi.convertToEmployee(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['candidates'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      qc.invalidateQueries({ queryKey: ['recruitment-stats'] });
    },
  });
}
export function useInterviews(params?: Record<string, any>) {
  return useQuery({ queryKey: ['interviews', params], queryFn: () => recruitmentApi.listInterviews(params) });
}
export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => recruitmentApi.createInterview(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interviews'] }); qc.invalidateQueries({ queryKey: ['recruitment-stats'] }); },
  });
}
export function useUpdateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) => recruitmentApi.updateInterview(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  });
}
export function useDeleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.deleteInterview(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interviews'] }); qc.invalidateQueries({ queryKey: ['recruitment-stats'] }); },
  });
}

// ── Chat ──────────────────────────────────────────────────────────────────────
export function useChatMessages() {
  return useQuery({ queryKey: ['chat'], queryFn: () => chatApi.getMessages() });
}
export function useSendChatMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => chatApi.sendMessage(text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chat'] }),
  });
}
export function useChatUnreadCounts() {
  return useQuery({ queryKey: ['chat-unread'], queryFn: () => chatApi.getUnreadCounts(), refetchInterval: 10000 });
}
export function useDMHistory(peerId: string) {
  return useQuery({ queryKey: ['chat-dm', peerId], queryFn: () => chatApi.getDMHistory(peerId), enabled: !!peerId });
}
export function useSendDM() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ peerId, text }: { peerId: string; text: string }) => chatApi.sendDM(peerId, text),
    onSuccess: (_data, { peerId }) => {
      qc.invalidateQueries({ queryKey: ['chat-dm', peerId] });
      qc.invalidateQueries({ queryKey: ['chat-unread'] });
    },
  });
}

// ── Finance ───────────────────────────────────────────────────────────────────
export function useFinanceDashboard() {
  return useQuery({ queryKey: ['finance-dashboard'], queryFn: () => financeApi.getDashboard(), staleTime: 60_000 });
}
export function useFinanceMonthlyAnalytics(year?: number) {
  return useQuery({ queryKey: ['finance-monthly', year], queryFn: () => financeApi.getMonthlyAnalytics(year) });
}
export function useFinanceExpenseBreakdown() {
  return useQuery({ queryKey: ['finance-expense-breakdown'], queryFn: () => financeApi.getExpenseBreakdown() });
}
export function useOpeningBalance() {
  return useQuery({ queryKey: ['finance-opening-balance'], queryFn: () => financeApi.getOpeningBalance() });
}
export function useSetOpeningBalance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => financeApi.setOpeningBalance(amount),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-opening-balance'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useFinanceClients(params?: Record<string, any>) {
  return useQuery({ queryKey: ['finance-clients', params], queryFn: () => financeApi.listClients(params) });
}
export function useCreateFinanceClient() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: any) => financeApi.createClient(d), onSuccess: () => qc.invalidateQueries({ queryKey: ['finance-clients'] }) });
}
export function useUpdateFinanceClient() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateClient(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['finance-clients'] }) });
}
export function useDeleteFinanceClient() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => financeApi.deleteClient(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['finance-clients'] }) });
}
export function useInvoices(params?: Record<string, any>) {
  return useQuery({ queryKey: ['finance-invoices', params], queryFn: () => financeApi.listInvoices(params), placeholderData: keepPreviousData });
}
export function useInvoice(id: string) {
  return useQuery({ queryKey: ['finance-invoice', id], queryFn: () => financeApi.getInvoice(id), enabled: !!id });
}
export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => financeApi.createInvoice(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-invoices'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateInvoice(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-invoices'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteInvoice(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-invoices'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useDuplicateInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => financeApi.duplicateInvoice(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['finance-invoices'] }) });
}
export function useMarkInvoicePaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.markInvoicePaid(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-invoices'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); qc.invalidateQueries({ queryKey: ['finance-payments'] }); },
  });
}
export function useFinancePayments(params?: Record<string, any>) {
  return useQuery({ queryKey: ['finance-payments', params], queryFn: () => financeApi.listPayments(params), placeholderData: keepPreviousData });
}
export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => financeApi.createPayment(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-payments'] }); qc.invalidateQueries({ queryKey: ['finance-invoices'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updatePayment(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-payments'] }); qc.invalidateQueries({ queryKey: ['finance-invoices'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deletePayment(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-payments'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useFinanceExpenses(params?: Record<string, any>) {
  return useQuery({ queryKey: ['finance-expenses', params], queryFn: () => financeApi.listExpenses(params), placeholderData: keepPreviousData });
}
export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => financeApi.createExpense(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-expenses'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); qc.invalidateQueries({ queryKey: ['finance-expense-breakdown'] }); },
  });
}
export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateExpense(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-expenses'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); qc.invalidateQueries({ queryKey: ['finance-expense-breakdown'] }); },
  });
}
export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deleteExpense(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-expenses'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useFinancePayroll(params?: Record<string, any>) {
  return useQuery({ queryKey: ['finance-payroll', params], queryFn: () => financeApi.listPayroll(params), placeholderData: keepPreviousData });
}
export function useCreatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: any) => financeApi.createPayroll(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-payroll'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useUpdatePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updatePayroll(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-payroll'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useDeletePayroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeApi.deletePayroll(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-payroll'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); },
  });
}
export function useFinanceBudgets(params?: Record<string, any>) {
  return useQuery({ queryKey: ['finance-budgets', params], queryFn: () => financeApi.listBudgets(params), placeholderData: keepPreviousData });
}
export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: any) => financeApi.createBudget(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-budgets'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); } });
}
export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => financeApi.updateBudget(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance-budgets'] }); qc.invalidateQueries({ queryKey: ['finance-dashboard'] }); } });
}
export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => financeApi.deleteBudget(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['finance-budgets'] }) });
}
export function useFinanceReports(params?: Record<string, any>) {
  return useQuery({ queryKey: ['finance-reports', params], queryFn: () => financeApi.getReports(params) });
}
