export type UserRole = 'donor' | 'ngo';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIInsights {
  safeConsumptionTime: string;
  urgencyLevel: UrgencyLevel;
  storageAdvice: string;
}

export interface Donation {
  id: string;
  title: string;
  quantity: number;
  pickupDeadline: string;
  foodType: 'veg' | 'non-veg';
  location: string;
  imageUrl: string;
  status: 'available' | 'accepted' | 'collected';
  donorId: string;
  donorName: string;
  createdAt?: string;
  acceptedBy?: string;
  ai: AIInsights;
}
