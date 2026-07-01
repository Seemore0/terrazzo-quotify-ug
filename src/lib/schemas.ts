import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().trim().min(1, 'Name required').max(100),
  phone: z.string().trim().min(6, 'Phone required').max(30),
  email: z.string().trim().email('Invalid email').max(255).optional().or(z.literal('')),
  location: z.string().trim().max(200).optional().or(z.literal('')),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const quotationSchema = z.object({
  customer_name: z.string().trim().min(1).max(100),
  customer_phone: z.string().trim().min(6).max(30),
  customer_location: z.string().trim().max(200).optional().or(z.literal('')),
  area_m2: z.number().positive('Area must be > 0'),
  work_mode: z.enum(['materials', 'labour', 'full']),
  style_id: z.string(),
  pattern_id: z.string(),
  notes: z.string().max(2000).optional().or(z.literal('')),
});
