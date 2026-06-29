import { AdminRepository } from './admin.repository';
import { UpdateUserDto, UpdateSubscriptionDto, FeatureFlagDto, SupportTicketDto } from './admin.dto';

export class AdminService {
  private repository = new AdminRepository();

  // Users
  async listUsers() {
    return this.repository.listUsers();
  }

  async updateUser(id: string, data: UpdateUserDto) {
    return this.repository.updateUser(id, data);
  }

  async deleteUser(id: string) {
    return this.repository.deleteUser(id);
  }

  // Subscriptions
  async listSubscriptions() {
    return this.repository.listSubscriptions();
  }

  async updateSubscription(id: string, data: UpdateSubscriptionDto) {
    return this.repository.updateSubscription(id, data);
  }

  // Feature Flags
  async listFeatureFlags() {
    return this.repository.listFeatureFlags();
  }

  async createFeatureFlag(data: FeatureFlagDto) {
    return this.repository.createFeatureFlag(data);
  }

  async updateFeatureFlag(id: string, data: Partial<FeatureFlagDto>) {
    return this.repository.updateFeatureFlag(id, data);
  }

  async deleteFeatureFlag(id: string) {
    return this.repository.deleteFeatureFlag(id);
  }

  // Support Tickets
  async listSupportTickets() {
    return this.repository.listSupportTickets();
  }

  async createSupportTicket(data: SupportTicketDto & { userId: string }) {
    return this.repository.createSupportTicket(data);
  }

  async updateSupportTicket(id: string, data: Partial<SupportTicketDto>) {
    return this.repository.updateSupportTicket(id, data);
  }

  async deleteSupportTicket(id: string) {
    return this.repository.deleteSupportTicket(id);
  }

  // Analytics (simplified placeholders)
  async getRevenueStats() {
    // Implement revenue aggregation via Prisma queries if needed
    return { totalRevenue: 0, monthly: [] };
  }

  async getAiUsageStats() {
    // Placeholder for AI usage stats
    return { totalEvaluations: 0, monthly: [] };
  }

  async getUserGrowthStats() {
    // Placeholder for user growth stats
    return { totalUsers: 0, monthlySignups: [] };
  }
}
