import { z } from 'zod';

export const donationSchema = z.object({
  title: z.string().min(3),
  quantity: z.coerce.number().int().positive(),
  pickupDeadline: z.string().min(1),
  foodType: z.enum(['veg', 'non-veg']),
  location: z.string().min(3),
  image: z.instanceof(File)
});
