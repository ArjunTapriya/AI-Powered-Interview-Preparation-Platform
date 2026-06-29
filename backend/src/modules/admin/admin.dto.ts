export interface UpdateUserDto {
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  isActive?: boolean;
}

export interface UpdateSubscriptionDto {
  plan?: 'FREE' | 'PRO' | 'PREMIUM';
  status?: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE';
  endDate?: Date;
}

export interface FeatureFlagDto {
  key: string;
  enabled: boolean;
}

export interface SupportTicketDto {
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}
