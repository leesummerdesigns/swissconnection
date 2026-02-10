import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(100),
  bio: z.string().max(500).optional(),
  languages: z.array(z.string()).optional(),
  postalCode: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  canton: z.string().max(50).optional(),
  avatarUrl: z.string().nullable().optional(),
});

export const reviewSchema = z.object({
  providerId: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string().min(10, "Review must be at least 10 characters").max(1000),
});

export const messageSchema = z.object({
  recipientId: z.string().optional(),
  threadId: z.string().optional(),
  body: z.string().min(1, "Message cannot be empty").max(2000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
