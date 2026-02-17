import crypto from "crypto"

/**
 * Verifica se uma senha corresponde ao hash armazenado
 * Better Auth usa o formato: salt:hash
 * Algoritmo: PBKDF2 com SHA-256, 10000 iterações, 64 bytes
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Verificar se o hash está no formato salt:hash
    if (!storedHash.includes(':')) {
      return false
    }

    const [salt, hash] = storedHash.split(':')
    
    // Gerar hash da senha fornecida usando os mesmos parâmetros
    const derivedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
    
    // Comparar os hashes de forma segura (timing-safe)
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(derivedHash, 'hex')
    )
  } catch (error) {
    console.error('Erro ao verificar senha:', error)
    return false
  }
}

/**
 * Cria um hash de senha no formato do Better Auth
 * Formato: salt:hash
 * Algoritmo: PBKDF2 com SHA-256, 10000 iterações, 64 bytes
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha256').toString('hex')
  return `${salt}:${hash}`
}
