"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, MoreHorizontal, Pen, Trash2, User } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/config/trpc/react";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader } from "@/interface/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/interface/components/ui/popover";
import { useSession } from "@/interface/hooks/useSession";

interface PostCardProps {
  post: {
    id: number;
    name: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  onDeleted?: () => void;
}

export function PostCard({ post, onDeleted }: PostCardProps) {
  const { user } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);

  const { mutate: deletePost } = apiClient.posts.delete.useMutation({
    onSuccess: () => {
      setIsDeleting(false);
      onDeleted?.();
    },
    onError: (error) => {
      setIsDeleting(false);
      console.error("Erro ao deletar post:", error);
    },
  });

  const canEdit = user?.id === post.createdBy.id || user?.role === "ADMIN";
  const canDelete = user?.id === post.createdBy.id || user?.role === "ADMIN";

  const handleDelete = () => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      setIsDeleting(true);
      deletePost({ id: post.id });
    }
  };

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold leading-none">{post.name}</h3>
              <div className="mt-1 flex items-center gap-2 text-muted-foreground text-sm">
                <span>{post.createdBy.name || post.createdBy.email}</span>
                <span>•</span>
                <span>{timeAgo}</span>
                {post.createdAt !== post.updatedAt && (
                  <>
                    <span>•</span>
                    <Badge className="text-xs" variant="secondary">
                      Editado
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <Popover>
              <PopoverTrigger asChild>
                <Button className="h-8 w-8 p-0" size="sm" variant="ghost">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48">
                <div className="space-y-1">
                  {canEdit && (
                    <Button
                      className="h-8 w-full justify-start gap-2"
                      onClick={() => {
                        // TODO: Implementar edição
                        console.log("Editar post:", post.id);
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <Pen className="h-4 w-4" />
                      Editar
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      className="h-8 w-full justify-start gap-2 text-destructive hover:text-destructive"
                      disabled={isDeleting}
                      onClick={handleDelete}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeleting ? "Deletando..." : "Deletar"}
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</div>
      </CardContent>
    </Card>
  );
}
