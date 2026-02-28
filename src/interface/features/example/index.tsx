"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { modal } from "@/interface/components/modal";
import { Autocomplete } from "@/interface/components/ui/autocomplete";
import { Button } from "@/interface/components/ui/button";
import { CheckboxWithLabel } from "@/interface/components/ui/checkbox";
import { DatePicker } from "@/interface/components/ui/date-picker";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/interface/components/ui/dialog";
import { FileUpload } from "@/interface/components/ui/file-upload";
import { Input } from "@/interface/components/ui/input";
import { SelectItem, SelectWithLabel } from "@/interface/components/ui/select";
import { Switch } from "@/interface/components/ui/switch";
import { SortableHeader, Table } from "@/interface/components/ui/table";
import { FileUploadExample, FileUploadMultipleExample, UploadsList } from "./components";

// Dados de exemplo para a tabela
type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Ativo" | "Inativo";
  createdAt: string;
};

const sampleUsers: User[] = [
  {
    id: 1,
    name: "João Silva",
    email: "joao@exemplo.com",
    role: "Admin",
    status: "Ativo",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@exemplo.com",
    role: "Editor",
    status: "Ativo",
    createdAt: "2024-02-20",
  },
  {
    id: 3,
    name: "Pedro Costa",
    email: "pedro@exemplo.com",
    role: "Viewer",
    status: "Inativo",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    name: "Ana Oliveira",
    email: "ana@exemplo.com",
    role: "Editor",
    status: "Ativo",
    createdAt: "2024-04-05",
  },
  {
    id: 5,
    name: "Carlos Ferreira",
    email: "carlos@exemplo.com",
    role: "Admin",
    status: "Ativo",
    createdAt: "2024-05-12",
  },
];

const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column}>Nome</SortableHeader>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader>,
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = String(row.getValue("status"));
      return (
        <span
          className={`inline-flex rounded-full px-2 py-1 font-semibold text-xs ${
            status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column}>Criado em</SortableHeader>,
    cell: ({ row }) => {
      const date = new Date(String(row.getValue("createdAt")));
      return date.toLocaleDateString("pt-BR");
    },
  },
];

export const ComponentExamples = () => {
  const [switchState, setSwitchState] = useState(false);
  const [selectValue, setSelectValue] = useState<string>();
  const [checkboxState, setCheckboxState] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const [autocompleteBasic, setAutocompleteBasic] = useState<string[]>([]);
  const [autocompleteMultiple, setAutocompleteMultiple] = useState<string[]>([]);
  const [autocompleteSingle, setAutocompleteSingle] = useState<string[]>([]);
  const [autocompleteError, setAutocompleteError] = useState<string[]>([]);

  // Função para mostrar modal de confirmação
  const showConfirmDialog = () => {
    modal.show({
      content: (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja realizar esta ação? Esta operação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                modal.close();
                alert("Ação cancelada!");
              }}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                modal.close();
                alert("Ação confirmada!");
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      ),
    });
  };

  // Função para mostrar modal personalizado
  const showCustomDialog = () => {
    modal.show({
      content: (
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modal Personalizado</DialogTitle>
            <DialogDescription>Este é um exemplo de modal com conteúdo personalizado.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <Input placeholder="Digite algo aqui..." />
              <div className="flex items-center space-x-2">
                <input id="terms" type="checkbox" />
                <label className="text-sm" htmlFor="terms">
                  Aceito os termos e condições
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => modal.close()} variant="outline">
              Fechar
            </Button>
            <Button
              onClick={() => {
                modal.close();
                alert("Dados salvos!");
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      ),
    });
  };

  // Função para mostrar modal lateral (right sheet)
  const showRightSheetDialog = () => {
    modal.show({
      content: (
        <DialogContent className="fixed top-0 right-0 h-full max-w-[60%] translate-x-0 translate-y-0 rounded-r-none rounded-l-md">
          <DialogHeader>
            <DialogTitle>Painel Lateral</DialogTitle>
            <DialogDescription>Este modal aparece como um painel lateral direito.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 py-4">
            <div className="space-y-4">
              <p>Conteúdo do painel lateral...</p>
              <Input placeholder="Campo de exemplo" />
              <Button className="w-full">Ação do Painel</Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => modal.close()} variant="outline">
              Fechar Painel
            </Button>
          </DialogFooter>
        </DialogContent>
      ),
    });
  };

  const techOptions = [
    { label: "React", value: "react" },
    { label: "TypeScript", value: "typescript" },
    { label: "Next.js", value: "nextjs" },
    { label: "Tailwind CSS", value: "tailwind" },
    { label: "JavaScript", value: "javascript" },
    { label: "Node.js", value: "nodejs" },
    { label: "Express", value: "express" },
    { label: "MongoDB", value: "mongodb" },
    { label: "PostgreSQL", value: "postgresql" },
    { label: "Redis", value: "redis" },
    { label: "Vue.js", value: "vuejs" },
    { label: "Angular", value: "angular" },
    { label: "Svelte", value: "svelte" },
    { label: "Python", value: "python" },
    { label: "Django", value: "django" },
  ];

  // Função para simular busca de opções
  const fetchTechOptions = async (query: string) => {
    // Simula delay de API
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!query) {
      return techOptions.slice(0, 5); // Retorna algumas opções iniciais
    }

    return techOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 p-6">
      <div className="space-y-2">
        <h1 className="font-bold text-3xl">Componentes UI</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Switch */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Switch</h2>
          <div className="space-y-3">
            <Switch checked={switchState} label="Básico" onCheckedChange={setSwitchState} />
            <Switch disabled label="Desabilitado" />
          </div>
        </div>

        {/* Button */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Button</h2>
          <div className="flex flex-col gap-3">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button size="sm" variant="ghost">
              Ghost
            </Button>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Input</h2>
          <div className="space-y-3">
            <Input placeholder="Texto simples" />
            <Input placeholder="Email" type="email" />
            <Input disabled placeholder="Desabilitado" />
          </div>
        </div>

        {/* Select */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Select</h2>
          <div className="space-y-3">
            <SelectWithLabel
              label="Básico"
              onValueChange={setSelectValue}
              placeholder="Selecione uma opção"
              value={selectValue}
            >
              <SelectItem value="option1">Opção 1</SelectItem>
              <SelectItem value="option2">Opção 2</SelectItem>
              <SelectItem value="option3">Opção 3</SelectItem>
            </SelectWithLabel>
            <SelectWithLabel disabled label="Desabilitado" placeholder="Desabilitado">
              <SelectItem value="disabled">Não disponível</SelectItem>
            </SelectWithLabel>
            <SelectWithLabel error="Este campo é obrigatório" label="Com erro" placeholder="Com erro">
              <SelectItem value="error">Erro</SelectItem>
            </SelectWithLabel>
          </div>
        </div>

        {/* Checkbox */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Checkbox</h2>
          <div className="space-y-3">
            <CheckboxWithLabel
              checked={checkboxState}
              label="Básico"
              onCheckedChange={(checked) => setCheckboxState(!!checked)}
            />
            <CheckboxWithLabel disabled label="Desabilitado" />
            <CheckboxWithLabel error="Este campo é obrigatório" label="Com erro" />
            <CheckboxWithLabel label="Label à esquerda" labelPosition="left" />
          </div>
        </div>

        {/* FileUpload */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">File Upload</h2>
          <div className="space-y-3">
            <FileUploadExample />
            <FileUploadMultipleExample />
            <FileUpload disabled label="Desabilitado" />
            <FileUpload accept="image/*" error="Arquivo obrigatório" label="Com erro" />
          </div>
        </div>

        {/* DatePicker */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Date Picker</h2>
          <div className="space-y-3">
            <DatePicker
              label="Data básica"
              onValueChange={setSelectedDate}
              placeholder="Selecione uma data"
              value={selectedDate}
            />
            <DatePicker dateFormat="MM/dd/yyyy" label="Formato americano" placeholder="MM/dd/yyyy" />
            <DatePicker label="Com data mínima" minDate={new Date()} placeholder="A partir de hoje" />
            <DatePicker disabled label="Desabilitado" />
            <DatePicker error="Data é obrigatória" label="Com erro" />
          </div>
        </div>

        {/* Modal Examples */}
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">Modal / Dialog</h2>
          <div className="space-y-3">
            <Button className="w-full" onClick={showConfirmDialog} variant="outline">
              Modal de Confirmação
            </Button>
            <Button className="w-full" onClick={showCustomDialog} variant="outline">
              Modal Personalizado
            </Button>
            <Button className="w-full" onClick={showRightSheetDialog} variant="outline">
              Painel Lateral (Right Sheet)
            </Button>
            <Button className="w-full" onClick={() => modal.closeAll()} size="sm" variant="destructive">
              Fechar Todos os Modais
            </Button>
          </div>
        </div>
      </div>
      {/* Uploads Salvos */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Meus Uploads</h2>
        </div>
        <UploadsList />
      </div>
      {/* Autocomplete */}
      <div className="space-y-3 rounded-lg border p-4">
        <h2 className="font-semibold">Autocomplete</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="font-medium text-sm">Básico (Seleção única)</label>
            <Autocomplete
              fetchOptions={fetchTechOptions}
              multiple={false}
              onSelectionChange={setAutocompleteSingle}
              placeholder="Digite para buscar tecnologias..."
              selectedValues={autocompleteSingle}
              showInitialOptions={true}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Múltipla seleção</label>
            <Autocomplete
              fetchOptions={fetchTechOptions}
              maxSelected={5}
              multiple={true}
              onSelectionChange={setAutocompleteMultiple}
              placeholder="Selecione múltiplas tecnologias..."
              selectedValues={autocompleteMultiple}
              showInitialOptions={true}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Com busca dinâmica</label>
            <Autocomplete
              debounceMs={500}
              emptyText="Nenhuma tecnologia encontrada"
              fetchOptions={fetchTechOptions}
              onSelectionChange={setAutocompleteBasic}
              placeholder="Digite pelo menos 2 caracteres..."
              selectedValues={autocompleteBasic}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-sm">Desabilitado</label>
            <Autocomplete
              disabled={true}
              fetchOptions={fetchTechOptions}
              onSelectionChange={() => {}}
              placeholder="Não disponível"
              selectedValues={[]}
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium text-destructive text-sm">Com estado de erro</label>
            <Autocomplete
              className="border-destructive focus:ring-destructive"
              fetchOptions={fetchTechOptions}
              onSelectionChange={setAutocompleteError}
              placeholder="Campo obrigatório"
              selectedValues={autocompleteError}
            />
            <p className="text-destructive text-sm">Este campo é obrigatório</p>
          </div>
        </div>
      </div>

      {/* Table Examples */}
      <div className="space-y-6">
        <h2 className="font-bold text-2xl">Tabela com Ordenação e Paginação</h2>

        {/* Basic Table */}
        <div className="space-y-3 rounded-lg border p-6">
          <h3 className="font-semibold text-lg">Tabela Básica</h3>
          <Table
            columns={userColumns}
            data={sampleUsers}
            onRowClick={(user) => alert(`Clicou no usuário: ${user.name}`)}
            searchable={true}
            searchColumn="name"
            searchPlaceholder="Buscar por nome..."
          />
        </div>

        {/* Table without search */}
        <div className="space-y-3 rounded-lg border p-6">
          <h3 className="font-semibold text-lg">Tabela sem Busca</h3>
          <Table columns={userColumns} data={sampleUsers} initialPageSize={3} searchable={false} />
        </div>

        {/* Table without pagination */}
        <div className="space-y-3 rounded-lg border p-6">
          <h3 className="font-semibold text-lg">Tabela sem Paginação</h3>
          <Table
            columns={userColumns}
            data={sampleUsers}
            enablePagination={false}
            searchPlaceholder="Buscar usuários..."
          />
        </div>
      </div>
    </div>
  );
};
