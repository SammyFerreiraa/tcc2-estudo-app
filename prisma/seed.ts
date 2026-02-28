import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Verificar se já existe um usuário admin
  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (existingAdmin) {
    console.log("✅ Usuário admin já existe:", existingAdmin.email);
    return;
  }

  // Criar usuário admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@sambytelabs.com.br",
      name: "Administrador",
      role: "ADMIN",
      emailVerified: new Date(),
      image: null,
    },
  });

  console.log("✅ Usuário admin criado com sucesso!");
  console.log("📧 Email:", admin.email);
  console.log("👤 Nome:", admin.name);
  console.log("🔑 Role:", admin.role);
  console.log("🆔 ID:", admin.id);
  console.log("");
  console.log("💡 Use o email acima para fazer login via Magic Link");
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
