import { S3 } from 'aws-sdk';
export declare const s3Client: S3;
export declare function uploadCDKAppZip(archivePath: string, s3BucketName: string, s3Key: string, verbose: boolean): Promise<void>;
