import { z } from "../../config/zod-config";

export const createPostSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  content: z.string().min(1, "Conteúdo é obrigatório").max(1000, "Conteúdo deve ter no máximo 1000 caracteres"),
});

export const updatePostSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  content: z.string().min(1, "Conteúdo é obrigatório").max(1000, "Conteúdo deve ter no máximo 1000 caracteres"),
});

export const getPostsSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  search: z.string().optional(),
});

export type ICreatePost = z.infer<typeof createPostSchema>;
export type IUpdatePost = z.infer<typeof updatePostSchema>;
export type IGetPosts = z.infer<typeof getPostsSchema>;
