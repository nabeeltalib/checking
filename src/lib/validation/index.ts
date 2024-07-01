import * as z from "zod";

// ============================================================
// USER
// ============================================================
export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  email: z.string().email(),
  bio: z.string().max(500, { message: "Bio must not exceed 500 characters." }).optional(),
});


// ============================================================
// LIST
// ============================================================
export const ListValidation = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Maximum 100 characters." }),
  description: z.string().min(5, { message: "Minimum 5 characters." }).max(1000, { message: "Maximum 1,000 characters" }),
  items: z.array(z.string()).min(1, { message: "At least one item is required." }).max(100, { message: "Maximum 100 items allowed." }),
  tags: z.array(z.string()).max(10, { message: "Maximum 10 tags allowed." }).optional(),
  aiScore: z.number().min(0).max(1).optional(),
});

// ============================================================
// COMMENT
// ============================================================
export const CommentValidation = z.object({
  listId: z.string(),
  userId: z.string(),
  content: z.string().min(1, { message: "Content is required." }).max(1000, { message: "Maximum 1,000 characters." }),
});

// ============================================================
// SUGGESTION
// ============================================================
export const SuggestionValidation = z.object({
  listId: z.string(),
  userId: z.string(),
  suggestedTitle: z.string().min(1, { message: "Title is required." }).max(100, { message: "Maximum 100 characters." }),
  suggestedDescription: z.string().min(5, { message: "Minimum 5 characters." }).max(1000, { message: "Maximum 1,000 characters" }),
  suggestedItems: z.array(z.string()).min(1, { message: "At least one item is required." }),
  status: z.string(),
});

// ============================================================
// COLLABORATION
// ============================================================
export const CollaborationStatus = z.enum(['pending', 'accepted', 'rejected']);

export const CollaborationValidation = z.object({
  listId: z.string(),
  userId: z.string(),
  status: CollaborationStatus,
});

// Add type inferences
export type SignupValidationSchema = z.infer<typeof SignupValidation>;
export type SigninValidationSchema = z.infer<typeof SigninValidation>;
export type ProfileValidationSchema = z.infer<typeof ProfileValidation>;
export type ListValidationSchema = z.infer<typeof ListValidation>;
export type CommentValidationSchema = z.infer<typeof CommentValidation>;
export type SuggestionValidationSchema = z.infer<typeof SuggestionValidation>;
export type CollaborationValidationSchema = z.infer<typeof CollaborationValidation>;
