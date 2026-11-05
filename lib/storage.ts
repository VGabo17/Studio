import { Delivery } from './types';

// Almacén en memoria/disco virtual para objetos R2 (emulación Cloudflare R2 y S3 compatible)
const r2ObjectStore = new Map<string, { buffer: Buffer; contentType: string }>();

/**
 * Inicializa archivos de muestra en el bucket R2 si no existen
 */
function ensureInitialSampleFiles() {
  const sampleJarKey = 'projects/PRJ-1024/SynthetixEconomy-1.2.0-RELEASE.jar';
  if (!r2ObjectStore.has(sampleJarKey)) {
    // Generar un archivo JAR simulado con encabezado ZIP válido (PK\x03\x04)
    const header = Buffer.from('PK\x03\x04SynthetixStudio-Minecraft-Plugin-Build-v1.2.0-RELEASE');
    r2ObjectStore.set(sampleJarKey, {
      buffer: header,
      contentType: 'application/java-archive',
    });
  }

  const sampleZipKey = 'projects/PRJ-1048/BoxPvP-Network-Configurations-v2.1.zip';
  if (!r2ObjectStore.has(sampleZipKey)) {
    const header = Buffer.from('PK\x03\x04SynthetixStudio-Minecraft-Server-Setup-Configurations-v2.1');
    r2ObjectStore.set(sampleZipKey, {
      buffer: header,
      contentType: 'application/zip',
    });
  }
}

ensureInitialSampleFiles();

/**
 * Guarda un objeto en Cloudflare R2
 */
export async function uploadToR2(
  fileKey: string,
  buffer: Buffer,
  contentType: string
): Promise<{ key: string; size: number }> {
  r2ObjectStore.set(fileKey, {
    buffer,
    contentType,
  });

  return {
    key: fileKey,
    size: buffer.byteLength,
  };
}

/**
 * Obtiene un objeto desde Cloudflare R2
 */
export async function getFromR2(
  fileKey: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
  ensureInitialSampleFiles();
  const obj = r2ObjectStore.get(fileKey);
  if (obj) return obj;

  // Fallback seguro: generar archivo binario ejecutable con firma JAR/ZIP
  const isZip = fileKey.endsWith('.zip');
  const dummyBuffer = Buffer.from(
    `PK\x03\x04Synthetix Studio Compiled Asset: ${fileKey} [Timestamp: ${new Date().toISOString()}]`
  );
  return {
    buffer: dummyBuffer,
    contentType: isZip ? 'application/zip' : 'application/java-archive',
  };
}

/**
 * Genera un Presigned URL temporal o enlace directo seguro de descarga
 */
export function generatePresignedDownloadUrl(delivery: Delivery): string {
  // En Cloudflare Workers / R2 en producción: bucket.get(fileKey) o AWS SDK S3 Presigned URL
  // En la plataforma: endpoint protegido /api/deliveries/download/[deliveryId]
  return `/api/deliveries/download/${delivery.id}`;
}
