export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^a-zA-Z0-9.-]/g, '') // Remove caracteres inválidos
    .toLowerCase(); // Converte para minúsculas
}
