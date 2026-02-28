"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { apiClient } from "@/config/trpc/react";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { Input } from "@/interface/components/ui/input";
import { useSession } from "@/interface/hooks/useSession";
import { CreatePostForm } from "./create-post-form";
import { PostCard } from "./post-card";

export function PostsFeature() {
  const { isAuthenticated } = useSession();
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 10;

  const { data, isLoading, refetch } = apiClient.posts.list.useQuery({
    limit,
    page,
    search: search || undefined,
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0); // Reset page when searching
  };

  const handlePostCreated = () => {
    setShowCreateForm(false);
    void refetch();
  };

  const handlePostDeleted = () => {
    void refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-3xl">Posts</h1>
          <p className="text-muted-foreground">Compartilhe suas ideias e interaja com a comunidade</p>
        </div>

        {isAuthenticated && (
          <Button className="gap-2" onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4" />
            Novo Post
          </Button>
        )}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Input
              className="pl-10"
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Pesquisar posts..."
              startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              value={search}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Post Form */}
      {showCreateForm && isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Post</CardTitle>
          </CardHeader>
          <CardContent>
            <CreatePostForm onSuccess={handlePostCreated} />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {data && (
        <div className="flex gap-4">
          <Badge className="px-3 py-1" variant="secondary">
            {data.total} {data.total === 1 ? "post encontrado" : "posts encontrados"}
          </Badge>
          {search && (
            <Badge className="px-3 py-1" variant="outline">
              Pesquisando por: &ldquo;{search}&rdquo;
            </Badge>
          )}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : data?.posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {search ? "Nenhum post encontrado para sua pesquisa." : "Nenhum post encontrado."}
              </p>
              {!isAuthenticated && (
                <p className="mt-2 text-muted-foreground text-sm">Faça login para criar o primeiro post!</p>
              )}
            </CardContent>
          </Card>
        ) : (
          data?.posts.map((post) => <PostCard key={post.id} onDeleted={handlePostDeleted} post={post} />)
        )}
      </div>

      {/* Pagination */}
      {data && data.total > limit && (
        <div className="flex items-center justify-center gap-2">
          <Button disabled={page === 0} onClick={() => setPage(page - 1)} variant="outline">
            Anterior
          </Button>

          <span className="px-4 py-2 text-muted-foreground text-sm">
            Página {page + 1} de {Math.ceil(data.total / limit)}
          </span>

          <Button disabled={!data.hasMore} onClick={() => setPage(page + 1)} variant="outline">
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
