import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Config } from "../config/s3.config";

export const S3Service = {
    uploadFile,
    deleteFile,
    getFileUrl
};

async function uploadFile(file: Express.Multer.File, folder: string = 'general') {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExtension}`;

    const command = new PutObjectCommand({
        Bucket: S3Config.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype
    });

    try {
        await S3Config.s3Client.send(command);
        // Return the key (path) of the file in S3
        return fileName;
    } catch (error) {
        console.error("Error uploading file to S3:", error);
        throw error;
    }
}

async function deleteFile(fileKey: string) {
    const command = new DeleteObjectCommand({
        Bucket: S3Config.bucketName,
        Key: fileKey
    });

    try {
        await S3Config.s3Client.send(command);
        return true;
    } catch (error) {
        console.error("Error deleting file from S3:", error);
        throw error;
    }
}

async function getFileUrl(fileKey: string) {
    const command = new GetObjectCommand({
        Bucket: S3Config.bucketName,
        Key: fileKey
    });

    try {
        const url = await getSignedUrl(S3Config.s3Client, command, { expiresIn: 3600 });
        return url;
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error;
    }
}
