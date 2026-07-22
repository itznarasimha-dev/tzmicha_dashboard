import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TZMicha Dashboard API',
      version: '1.0.0',
      description: 'Backend API for TZMicha IT Solutions Dashboard',
    },
    servers: [{ url: 'http://localhost:5000/api', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',          description: 'Authentication endpoints' },
      { name: 'Users',         description: 'User management' },
      { name: 'Projects',      description: 'Project management' },
      { name: 'Tasks',         description: 'Task management' },
      { name: 'Sprints',       description: 'Sprint board' },
      { name: 'Work Updates',  description: 'Daily work updates' },
      { name: 'Leave',         description: 'Leave management' },
      { name: 'Attendance',    description: 'Attendance tracking' },
      { name: 'Campaigns',     description: 'Marketing campaigns' },
      { name: 'Deals',         description: 'Sales pipeline' },
      { name: 'Roadmap',       description: 'Product roadmap' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Activity',      description: 'Activity feed' },
      { name: 'Settings',      description: 'App settings' },
    ],
    paths: {
      // ── Auth ──────────────────────────────────────────────────────────────
      '/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Login', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email','password'], properties: { email: { type: 'string', example: 'alex.morgan@tzmicha.com' }, password: { type: 'string', example: 'admin123' } } } } } },
          responses: { 200: { description: 'Login successful — returns accessToken, refreshToken, user' } },
        },
      },
      '/auth/refresh': {
        post: { tags: ['Auth'], summary: 'Refresh access token', security: [], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } }, responses: { 200: { description: 'New access token' } } },
      },
      '/auth/logout': {
        post: { tags: ['Auth'], summary: 'Logout', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } }, responses: { 200: { description: 'Logged out' } } },
      },
      '/auth/me': {
        get: { tags: ['Auth'], summary: 'Get current user', responses: { 200: { description: 'Current user profile' } } },
      },

      // ── Users ─────────────────────────────────────────────────────────────
      '/users': {
        get: { tags: ['Users'], summary: 'List users', parameters: [{ in: 'query', name: 'role', schema: { type: 'string' } }, { in: 'query', name: 'search', schema: { type: 'string' } }, { in: 'query', name: 'page', schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { 200: { description: 'Paginated user list' } } },
      },
      '/users/{id}': {
        get:   { tags: ['Users'], summary: 'Get user by ID',  parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'User object' } } },
        patch: { tags: ['Users'], summary: 'Update user',     parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated user' } } },
        delete:{ tags: ['Users'], summary: 'Delete user',     parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },
      '/users/{id}/password': {
        patch: { tags: ['Users'], summary: 'Change password', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } } } } } }, responses: { 200: { description: 'Password updated' } } },
      },

      // ── Projects ──────────────────────────────────────────────────────────
      '/projects': {
        get:  { tags: ['Projects'], summary: 'List projects', parameters: [{ in: 'query', name: 'status', schema: { type: 'string' } }, { in: 'query', name: 'search', schema: { type: 'string' } }], responses: { 200: { description: 'Project list' } } },
        post: { tags: ['Projects'], summary: 'Create project', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['name','description','startDate'], properties: { name: { type: 'string' }, description: { type: 'string' }, startDate: { type: 'string' }, endDate: { type: 'string' }, color: { type: 'string' } } } } } }, responses: { 201: { description: 'Created project' } } },
      },
      '/projects/{id}': {
        get:    { tags: ['Projects'], summary: 'Get project',    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Project object' } } },
        patch:  { tags: ['Projects'], summary: 'Update project', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated project' } } },
        delete: { tags: ['Projects'], summary: 'Delete project', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // ── Tasks ─────────────────────────────────────────────────────────────
      '/tasks': {
        get:  { tags: ['Tasks'], summary: 'List tasks', parameters: [{ in: 'query', name: 'status', schema: { type: 'string' } }, { in: 'query', name: 'priority', schema: { type: 'string' } }, { in: 'query', name: 'projectId', schema: { type: 'string' } }, { in: 'query', name: 'sprintId', schema: { type: 'string' } }, { in: 'query', name: 'assigneeId', schema: { type: 'string' } }], responses: { 200: { description: 'Task list' } } },
        post: { tags: ['Tasks'], summary: 'Create task', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['title','projectId'], properties: { title: { type: 'string' }, projectId: { type: 'string' }, sprintId: { type: 'string' }, status: { type: 'string' }, priority: { type: 'string' }, assigneeId: { type: 'string' } } } } } }, responses: { 201: { description: 'Created task' } } },
      },
      '/tasks/{id}': {
        get:    { tags: ['Tasks'], summary: 'Get task',    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Task object' } } },
        patch:  { tags: ['Tasks'], summary: 'Update task', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated task' } } },
        delete: { tags: ['Tasks'], summary: 'Delete task', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },
      '/tasks/{id}/status': {
        patch: { tags: ['Tasks'], summary: 'Update task status', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['backlog','todo','in_progress','in_review','done','blocked'] } } } } } }, responses: { 200: { description: 'Updated' } } },
      },

      // ── Sprints ───────────────────────────────────────────────────────────
      '/sprints': {
        get:  { tags: ['Sprints'], summary: 'List sprints', parameters: [{ in: 'query', name: 'projectId', schema: { type: 'string' } }], responses: { 200: { description: 'Sprint list' } } },
        post: { tags: ['Sprints'], summary: 'Create sprint', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['name','projectId','startDate','endDate'], properties: { name: { type: 'string' }, projectId: { type: 'string' }, startDate: { type: 'string' }, endDate: { type: 'string' }, goal: { type: 'string' } } } } } }, responses: { 201: { description: 'Created sprint' } } },
      },
      '/sprints/{id}': {
        get:    { tags: ['Sprints'], summary: 'Get sprint with tasks', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Sprint with tasks' } } },
        patch:  { tags: ['Sprints'], summary: 'Update sprint',         parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Sprints'], summary: 'Delete sprint',         parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // ── Work Updates ──────────────────────────────────────────────────────
      '/work-updates': {
        get:  { tags: ['Work Updates'], summary: 'List work updates', parameters: [{ in: 'query', name: 'date', schema: { type: 'string' } }], responses: { 200: { description: 'Work update list' } } },
        post: { tags: ['Work Updates'], summary: 'Submit work update', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { date: { type: 'string' }, totalHours: { type: 'number' }, blockers: { type: 'string' }, planForTomorrow: { type: 'string' }, tasks: { type: 'array' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/work-updates/{id}': {
        get:    { tags: ['Work Updates'], summary: 'Get work update',    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Work update' } } },
        patch:  { tags: ['Work Updates'], summary: 'Update work update', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Work Updates'], summary: 'Delete work update', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // ── Leave ─────────────────────────────────────────────────────────────
      '/leave': {
        get:  { tags: ['Leave'], summary: 'List leave requests', parameters: [{ in: 'query', name: 'status', schema: { type: 'string' } }], responses: { 200: { description: 'Leave request list' } } },
        post: { tags: ['Leave'], summary: 'Create leave request', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['type','startDate','endDate','days','reason'], properties: { type: { type: 'string', enum: ['annual','sick','casual','unpaid'] }, startDate: { type: 'string' }, endDate: { type: 'string' }, days: { type: 'integer' }, reason: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/leave/{id}/status': {
        patch: { tags: ['Leave'], summary: 'Approve/reject leave', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', enum: ['approved','rejected'] } } } } } }, responses: { 200: { description: 'Updated' } } },
      },
      '/leave/balance/me': {
        get: { tags: ['Leave'], summary: 'Get my leave balance', responses: { 200: { description: 'Leave balance' } } },
      },

      // ── Attendance ────────────────────────────────────────────────────────
      '/attendance': {
        get:  { tags: ['Attendance'], summary: 'List attendance', parameters: [{ in: 'query', name: 'userId', schema: { type: 'string' } }, { in: 'query', name: 'startDate', schema: { type: 'string' } }, { in: 'query', name: 'endDate', schema: { type: 'string' } }], responses: { 200: { description: 'Attendance records' } } },
        post: { tags: ['Attendance'], summary: 'Mark attendance', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['date','status'], properties: { userId: { type: 'string' }, date: { type: 'string' }, status: { type: 'string', enum: ['present','absent','late','half_day','holiday'] }, checkIn: { type: 'string' }, checkOut: { type: 'string' } } } } } }, responses: { 200: { description: 'Upserted' } } },
      },

      // ── Campaigns ─────────────────────────────────────────────────────────
      '/campaigns/stats': {
        get: { tags: ['Campaigns'], summary: 'Campaign stats', responses: { 200: { description: 'Aggregated stats' } } },
      },
      '/campaigns': {
        get:  { tags: ['Campaigns'], summary: 'List campaigns', parameters: [{ in: 'query', name: 'status', schema: { type: 'string' } }, { in: 'query', name: 'channel', schema: { type: 'string' } }], responses: { 200: { description: 'Campaign list' } } },
        post: { tags: ['Campaigns'], summary: 'Create campaign', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['name','channel','budget','startDate'], properties: { name: { type: 'string' }, channel: { type: 'string', enum: ['email','social','paid','content','seo'] }, budget: { type: 'number' }, startDate: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/campaigns/{id}': {
        get:    { tags: ['Campaigns'], summary: 'Get campaign',    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Campaign' } } },
        patch:  { tags: ['Campaigns'], summary: 'Update campaign', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Campaigns'], summary: 'Delete campaign', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // ── Deals ─────────────────────────────────────────────────────────────
      '/deals/stats': {
        get: { tags: ['Deals'], summary: 'Pipeline stats', responses: { 200: { description: 'Pipeline stats' } } },
      },
      '/deals': {
        get:  { tags: ['Deals'], summary: 'List deals', parameters: [{ in: 'query', name: 'stage', schema: { type: 'string' } }], responses: { 200: { description: 'Deal list' } } },
        post: { tags: ['Deals'], summary: 'Create deal', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['title','company','value'], properties: { title: { type: 'string' }, company: { type: 'string' }, value: { type: 'number' }, stage: { type: 'string' }, probability: { type: 'integer' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/deals/{id}': {
        get:    { tags: ['Deals'], summary: 'Get deal',    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deal' } } },
        patch:  { tags: ['Deals'], summary: 'Update deal', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Deals'], summary: 'Delete deal', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // ── Roadmap ───────────────────────────────────────────────────────────
      '/roadmap': {
        get:  { tags: ['Roadmap'], summary: 'List roadmap items', parameters: [{ in: 'query', name: 'status', schema: { type: 'string' } }, { in: 'query', name: 'year', schema: { type: 'integer' } }, { in: 'query', name: 'quarter', schema: { type: 'string' } }], responses: { 200: { description: 'Roadmap items' } } },
        post: { tags: ['Roadmap'], summary: 'Create roadmap item', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['title','quarter','year'], properties: { title: { type: 'string' }, quarter: { type: 'string' }, year: { type: 'integer' }, status: { type: 'string' }, team: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/roadmap/{id}': {
        get:    { tags: ['Roadmap'], summary: 'Get roadmap item',    parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Roadmap item' } } },
        patch:  { tags: ['Roadmap'], summary: 'Update roadmap item', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Roadmap'], summary: 'Delete roadmap item', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // ── Notifications ─────────────────────────────────────────────────────
      '/notifications': {
        get: { tags: ['Notifications'], summary: 'List my notifications', parameters: [{ in: 'query', name: 'read', schema: { type: 'boolean' } }], responses: { 200: { description: 'Notification list' } } },
      },
      '/notifications/unread-count': {
        get: { tags: ['Notifications'], summary: 'Get unread count', responses: { 200: { description: 'Count' } } },
      },
      '/notifications/read-all': {
        patch: { tags: ['Notifications'], summary: 'Mark all as read', responses: { 200: { description: 'Done' } } },
      },
      '/notifications/{id}/read': {
        patch: { tags: ['Notifications'], summary: 'Mark one as read', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      },
      '/notifications/{id}': {
        delete: { tags: ['Notifications'], summary: 'Delete notification', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // ── Activity ──────────────────────────────────────────────────────────
      '/activity': {
        get: { tags: ['Activity'], summary: 'List activity feed', parameters: [{ in: 'query', name: 'userId', schema: { type: 'string' } }, { in: 'query', name: 'type', schema: { type: 'string' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { 200: { description: 'Activity list' } } },
      },

      // ── Settings ──────────────────────────────────────────────────────────
      '/settings': {
        get: { tags: ['Settings'], summary: 'Get all settings', responses: { 200: { description: 'Settings object' } } },
        post: { tags: ['Settings'], summary: 'Upsert single setting', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { key: { type: 'string' }, value: { type: 'string' } } } } } }, responses: { 200: { description: 'Updated' } } },
        put: { tags: ['Settings'], summary: 'Upsert multiple settings', requestBody: { content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: { description: 'Updated' } } },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
