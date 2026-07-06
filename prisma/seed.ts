import { PrismaClient, TaskPriority, TaskStatus, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const TASK_DEFINITIONS = [
  // Semana 0 (semana atual) - 3 tarefas
  {
    week: 0,
    day: 0,
    title: "Configurar ambiente de desenvolvimento",
    description: "Instalar dependências e validar ferramentas de desenvolvimento.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 0,
  },
  {
    week: 0,
    day: 1,
    title: "Revisar estrutura do banco de dados",
    description: "Checar relacionamentos e índices da tabela de tarefas.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    userIndex: 1,
  },
  {
    week: 0,
    day: 2,
    title: "Planejar layout da listagem",
    description: "Criar rascunho de tela para listagem responsiva.",
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    userIndex: 0,
  },

  // Semana 1 (1 semana atrás) - 4 tarefas
  {
    week: 1,
    day: 0,
    title: "Implementar autenticação por credenciais",
    description: "Validar fluxo com bcrypt e cookies de sessão.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 1,
  },
  {
    week: 1,
    day: 1,
    title: "Adicionar validação de schema Zod",
    description: "Garantir schemas únicos compartilhados entre cliente e servidor.",
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    userIndex: 0,
  },
  {
    week: 1,
    day: 3,
    title: "Testar endpoints tRPC",
    description: "Verificar procedures públicas e protegidas de usuário.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    userIndex: 1,
  },
  {
    week: 1,
    day: 4,
    title: "Criar componente de alerta customizado",
    description: "Componente reutilizável com variantes de feedback visual.",
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    userIndex: 0,
  },

  // Semana 2 (2 semanas atrás) - 4 tarefas
  {
    week: 2,
    day: 1,
    title: "Integrar biblioteca de gráficos",
    description: "Verificar compatibilidade com a versão mais recente do React.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 1,
  },
  {
    week: 2,
    day: 2,
    title: "Refatorar componentes de formulário",
    description: "Padronizar uso do React Hook Form com zodResolver.",
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    userIndex: 0,
  },
  {
    week: 2,
    day: 4,
    title: "Documentar rotas protegidas",
    description: "Atualizar route-control e documentação de permissões.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.LOW,
    userIndex: 1,
  },
  {
    week: 2,
    day: 5,
    title: "Definir paleta de cores acessível",
    description: "Ajustar contraste do tema nos componentes principais.",
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    userIndex: 0,
  },

  // Semana 3 (3 semanas atrás) - 0 TAREFAS (Semana vazia dentro das últimas 8)

  // Semana 4 (4 semanas atrás) - 4 tarefas
  {
    week: 4,
    day: 0,
    title: "Criar endpoints para exportação de dados",
    description: "Permitir exportação de dados em formato legível.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 1,
  },
  {
    week: 4,
    day: 2,
    title: "Otimizar consultas no Prisma",
    description: "Adicionar índices faltantes em colunas frequentemente filtradas.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 0,
  },
  {
    week: 4,
    day: 3,
    title: "Implementar paginação no backend",
    description: "Configurar limit e offset para queries pesadas.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    userIndex: 1,
  },
  {
    week: 4,
    day: 5,
    title: "Criar testes unitários para utilitários",
    description: "Cobrir funções de data e formatação monetária.",
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    userIndex: 0,
  },

  // Semana 5 (5 semanas atrás) - 4 tarefas
  {
    week: 5,
    day: 1,
    title: "Configurar monitoramento de logs",
    description: "Verificar logs estruturados em ambiente de desenvolvimento.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 1,
  },
  {
    week: 5,
    day: 2,
    title: "Ajustar cabeçalhos de segurança HTTP",
    description: "Adicionar headers recomendados pela OWASP no middleware.",
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    userIndex: 0,
  },
  {
    week: 5,
    day: 3,
    title: "Refatorar hook de sessão de usuário",
    description: "Centralizar controle de estado de login no cliente.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    userIndex: 1,
  },
  {
    week: 5,
    day: 4,
    title: "Desenvolver tela de perfil do usuário",
    description: "Interface para alterar preferências e dados cadastrais.",
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    userIndex: 0,
  },

  // Semana 6 (6 semanas atrás) - 0 TAREFAS (Semana vazia dentro das últimas 8)

  // Semana 7 (7 semanas atrás) - 4 tarefas
  {
    week: 7,
    day: 0,
    title: "Configurar pipeline de lint e typecheck",
    description: "Garantir validações automáticas no pré-commit.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 1,
  },
  {
    week: 7,
    day: 1,
    title: "Criar seed inicial para testes de carga",
    description: "Gerar dados volumosos para testar limites de paginação.",
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    userIndex: 0,
  },
  {
    week: 7,
    day: 3,
    title: "Revisar políticas de CORS",
    description: "Restringir origens permitidas para requisições de API.",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    userIndex: 1,
  },
  {
    week: 7,
    day: 4,
    title: "Criar componentes de skeleton loading",
    description: "Melhorar feedback visual durante carregamento inicial de telas.",
    status: TaskStatus.TODO,
    priority: TaskPriority.LOW,
    userIndex: 0,
  },

  // Semana 8 (8 semanas atrás) - 3 tarefas
  {
    week: 8,
    day: 0,
    title: "Planejar arquitetura feature-first",
    description: "Documentar divisão de responsabilidades por módulos de domínio.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 1,
  },
  {
    week: 8,
    day: 2,
    title: "Estruturar modelos relacionais no banco",
    description: "Modelar entidades User, Task e Sessions.",
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    userIndex: 0,
  },
  {
    week: 8,
    day: 4,
    title: "Mapear casos de uso principais",
    description: "Definir jornadas do usuário para o gerenciador de tarefas.",
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    userIndex: 1,
  },

  // Semana 9 (9 semanas atrás - cobrindo 10 semanas no total) - 4 tarefas
  {
    week: 9,
    day: 0,
    title: "Kickoff e levantamento de requisitos",
    description: "Definição de escopo e objetivos principais do projeto.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 0,
  },
  {
    week: 9,
    day: 1,
    title: "Escolha da stack tecnológica",
    description: "Avaliação do ecossistema Next.js, tRPC e Prisma.",
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    userIndex: 1,
  },
  {
    week: 9,
    day: 2,
    title: "Configuração do repositório Git",
    description: "Definir convenções de commits, branches e regras de merge.",
    status: TaskStatus.DONE,
    priority: TaskPriority.MEDIUM,
    userIndex: 0,
  },
  {
    week: 9,
    day: 4,
    title: "Benchmark de ferramentas de IA",
    description: "Pesquisa inicial de suporte de ferramentas no fluxo de trabalho.",
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    userIndex: 1,
  },
];

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // 1. Manter admin existente ou criar caso não exista
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: UserRole.ADMIN,
    },
  });

  if (existingAdmin) {
    console.log("✅ Usuário admin já existe (mantido):", existingAdmin.email);
  } else {
    const admin = await prisma.user.create({
      data: {
        email: "admin@sambytelabs.com.br",
        name: "Administrador",
        role: UserRole.ADMIN,
        emailVerified: new Date(),
        image: null,
      },
    });
    console.log("✅ Usuário admin criado com sucesso:", admin.email);
  }

  // 2. Limpar apenas os usuários de teste (e suas tarefas via cascade)
  const testEmails = ["teste1@example.com", "teste2@example.com"];
  await prisma.user.deleteMany({
    where: {
      email: { in: testEmails },
    },
  });
  console.log("🧹 Usuários de teste anteriores removidos com sucesso.");

  // 3. Criar usuários de teste com senha hasheada com bcryptjs
  const passwordHash = await bcrypt.hash("Teste@123", 10);

  const testUser1 = await prisma.user.create({
    data: {
      email: "teste1@example.com",
      name: "Usuário Teste 1",
      role: UserRole.MEMBER,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  const testUser2 = await prisma.user.create({
    data: {
      email: "teste2@example.com",
      name: "Usuário Teste 2",
      role: UserRole.MEMBER,
      passwordHash,
      emailVerified: new Date(),
    },
  });

  console.log("✅ Usuários de teste criados:", testUser1.email, testUser2.email);

  // 4. Calcular datas de referência baseadas na semana atual
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Segunda = 0, Terça = 1, ..., Domingo = 6
  const currentMonday = new Date(now);
  currentMonday.setDate(now.getDate() - dayOfWeek);
  currentMonday.setHours(12, 0, 0, 0);

  const testUsers = [testUser1, testUser2];

  const tasksData = TASK_DEFINITIONS.map((def) => {
    const taskDate = new Date(currentMonday);
    taskDate.setDate(currentMonday.getDate() - def.week * 7 + def.day);

    const user = testUsers[def.userIndex];

    return {
      title: def.title,
      description: def.description,
      status: def.status,
      priority: def.priority,
      createdById: user.id,
      createdAt: taskDate,
      updatedAt: taskDate,
    };
  });

  await prisma.task.createMany({
    data: tasksData,
  });

  console.log(`✅ ${tasksData.length} tarefas criadas e distribuídas entre os usuários de teste.`);
  console.log("📅 Cobertura: 10 semanas (com semanas 3 e 6 completamente vazias dentro das últimas 8).");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro ao executar seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
