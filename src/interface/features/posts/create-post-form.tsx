"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createPostSchema, type ICreatePost } from "@/common/schemas/post";
import { apiClient } from "@/config/trpc/react";
import { Button } from "@/interface/components/ui/button";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: createPost } = apiClient.posts.create.useMutation({
    onSuccess: () => {
      reset();
      setIsSubmitting(false);
      onSuccess?.();
    },
    onError: (error) => {
      setIsSubmitting(false);
      console.error("Erro ao criar post:", error);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ICreatePost>({
    resolver: zodResolver(createPostSchema),
  });

  const contentValue = watch("content") || "";
  const nameValue = watch("name") || "";

  const onSubmit = (data: ICreatePost) => {
    setIsSubmitting(true);
    createPost(data);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">Título do Post</Label>
        <Input
          id="name"
          placeholder="Digite o título do seu post..."
          {...register("name")}
          aria-invalid={!!errors.name}
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        <div className="text-right text-muted-foreground text-xs">{nameValue.length}/100 caracteres</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo</Label>
        <textarea
          id="content"
          placeholder="Compartilhe suas ideias..."
          rows={6}
          {...register("content")}
          aria-invalid={!!errors.content}
          className="flex min-h-[150px] w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isSubmitting}
        />
        {errors.content && <p className="text-destructive text-sm">{errors.content.message}</p>}
        <div className="text-right text-muted-foreground text-xs">{contentValue.length}/1000 caracteres</div>
      </div>

      <div className="flex gap-2">
        <Button className="gap-2" disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              Publicando...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Publicar Post
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
