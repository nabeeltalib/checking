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
  bio: z.string().optional(),
});

// ============================================================
// POST
// ============================================================
export const PostValidation = z.object({
  caption: z.string().min(5, { message: "Minimum 5 characters." }).max(2200, { message: "Maximum 2,200 characters" }),
  file: z.custom<File[]>(),
  location: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
  tags: z.string().optional(),
});

// ============================================================
// LIST
// ============================================================
export const ListValidation = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Maximum 100 characters." }),
  description: z.string().min(5, { message: "Minimum 5 characters." }).max(1000, { message: "Maximum 1,000 characters" }),
  items: z.array(z.string()).min(1, { message: "At least one item is required." }),
  tags: z.string().optional(),
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
export const CollaborationValidation = z.object({
  listId: z.string(),
  userId: z.string(),
  status: z.string(),
});
