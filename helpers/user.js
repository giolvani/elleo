import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserDatabase {
  constructor() {
    this.prisma = prisma;
  }

  // Adicionar um usuário
  async addUser(id, data) {
    return await this.prisma.user.create({
      data: { id, ...data }
    });
  }

  // Buscar usuário pelo ID
  async getUserById(id) {
    return await this.prisma.user.findUnique({
      where: { id }
    });
  }

  // Buscar usuário pelo Thread ID
  async getUserByThreadId(threadId) {
    return await this.prisma.user.findFirst({
      where: { threadId }
    });
  }

  // Atualizar dados de um usuário
  async updateUser(id, newData) {
    return await this.prisma.user.update({
      where: { id },
      data: newData
    });
  }

  // Remover usuário
  async removeUser(id) {
    return await this.prisma.user.delete({
      where: { id }
    });
  }

  // Buscar todos os usuários
  async getAllUsers() {
    return await this.prisma.user.findMany();
  }

  // Criar um backup do usuário
  async backupUserId(id) {
    const user = await this.getUserById(id);
    if (user) {
      const currentDate = new Date().toISOString();
      const newId = `${user.id}_backup_${currentDate}`;
      await this.prisma.user.create({
        data: {
          id: newId,
          ...user
        }
      });
      return newId;
    }
    return null;
  }
}
