import { Router } from 'express';
import { AdminController } from './admin.controller';
import { rbacMiddleware, Role } from '../../middleware/rbac.middleware';

const router = Router();

// All admin routes require ADMIN or SUPER_ADMIN role
router.use(rbacMiddleware([Role.ADMIN, Role.SUPER_ADMIN]));

// User Management
router.get('/users', AdminController.listUsers);
router.patch('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Subscription Management
router.get('/subscriptions', AdminController.listSubscriptions);
router.patch('/subscriptions/:id', AdminController.updateSubscription);

// Feature Flags
router.get('/feature-flags', AdminController.listFeatureFlags);
router.post('/feature-flags', AdminController.createFeatureFlag);
router.patch('/feature-flags/:id', AdminController.updateFeatureFlag);
router.delete('/feature-flags/:id', AdminController.deleteFeatureFlag);

// Support Tickets
router.get('/support-tickets', AdminController.listSupportTickets);
router.post('/support-tickets', AdminController.createSupportTicket);
router.patch('/support-tickets/:id', AdminController.updateSupportTicket);
router.delete('/support-tickets/:id', AdminController.deleteSupportTicket);

// Analytics Endpoints
router.get('/analytics/revenue', AdminController.getRevenueStats);
router.get('/analytics/ai-usage', AdminController.getAiUsageStats);
router.get('/analytics/user-growth', AdminController.getUserGrowthStats);

// Content Generation (Question Bank)
router.post('/generate-question', AdminController.generateQuestion);

export const adminRoutes = router;
