import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Obtém um valor da tabela Config pelo nome da chave.
 * @param {string} key Nome da chave.
 * @returns {Promise<string>} Valor da configuração.
 */
export async function getConfigValue(key) {
  const config = await prisma.config.findUnique({ where: { key } });
  return config ? config.value : null;
}
