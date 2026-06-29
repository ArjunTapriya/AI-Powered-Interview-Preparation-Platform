import { prisma } from "../../config/database";
import { SubscriptionPlan, PaymentStatus } from "@prisma/client";

export const subscriptionRepository = {
  async getSubscription(userId: string) {
    return prisma.subscription.findUnique({ where: { userId } });
  },

  async upsertSubscription(userId: string, plan: SubscriptionPlan, paymentId?: string, orderId?: string) {
    return prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        status: "ACTIVE",
        startDate: new Date(),
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
      },
      update: {
        plan,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: null,
        razorpayPaymentId: paymentId,
        razorpayOrderId: orderId,
        updatedAt: new Date(),
      },
    });
  },

  async cancelSubscription(userId: string) {
    return prisma.subscription.update({
      where: { userId },
      data: { status: "CANCELLED", endDate: new Date() },
    });
  },

  async createTransaction(data: {
    userId: string;
    razorpayOrderId: string;
    amount: number;
    plan: SubscriptionPlan;
  }) {
    return prisma.paymentTransaction.create({ data });
  },

  async updateTransaction(
    razorpayOrderId: string,
    data: {
      razorpayPaymentId?: string;
      razorpaySignature?: string;
      status: PaymentStatus;
    }
  ) {
    return prisma.paymentTransaction.update({
      where: { razorpayOrderId },
      data,
    });
  },

  async findTransaction(razorpayOrderId: string) {
    return prisma.paymentTransaction.findUnique({ where: { razorpayOrderId } });
  },
};
