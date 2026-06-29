import { PrismaClient, User, Subscription, FeatureFlag, SupportTicket, Role, TicketPriority } from '@prisma/client';

const prisma = new PrismaClient();

export class AdminRepository {
  // Users
  async listUsers(): Promise<User[]> {
    return prisma.user.findMany();
  }

  async updateUser(id: string, data: { role?: Role; isActive?: boolean }) {
    return prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
  }

  // Subscriptions
  async listSubscriptions(): Promise<Subscription[]> {
    return prisma.subscription.findMany({ include: { user: true } });
  }

  async updateSubscription(id: string, data: any) {
    return prisma.subscription.update({ where: { id }, data });
  }

  // Feature Flags
  async listFeatureFlags(): Promise<FeatureFlag[]> {
    return prisma.featureFlag.findMany();
  }

  async createFeatureFlag(data: { key: string; enabled: boolean }) {
    return prisma.featureFlag.create({ data });
  }

  async updateFeatureFlag(id: string, data: { enabled?: boolean }) {
    return prisma.featureFlag.update({ where: { id }, data });
  }

  async deleteFeatureFlag(id: string) {
    return prisma.featureFlag.delete({ where: { id } });
  }

  // Support Tickets
  async listSupportTickets(): Promise<SupportTicket[]> {
    return prisma.supportTicket.findMany({ include: { user: true } });
  }

  async createSupportTicket(data: { userId: string; subject: string; description: string; priority?: TicketPriority }) {
    return prisma.supportTicket.create({ data });
  }

  async updateSupportTicket(id: string, data: any) {
    return prisma.supportTicket.update({ where: { id }, data });
  }

  async deleteSupportTicket(id: string) {
    return prisma.supportTicket.delete({ where: { id } });
  }
}
