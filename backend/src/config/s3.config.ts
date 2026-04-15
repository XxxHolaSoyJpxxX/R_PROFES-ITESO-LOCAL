import { S3Client } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config();

/**
 * s3.config.ts — VERSIÓN LOCAL
 *
 * MinIO es 100% compatible con la API de AWS S3.
 * Solo hay que agregar `endpoint` y `forcePathStyle: true`.
 * El s3.service.ts no necesita ningún cambio.
 */
const s3Client = new S3Client({
  region:   process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID     || 'minioadmin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'minioadmin123',
  },
  forcePathStyle: true,  // Requerido para MinIO
});

export const S3Config = {
  s3Client,
  bucketName: process.env.AWS_BUCKET_NAME || 'iteso-archivos',
};
