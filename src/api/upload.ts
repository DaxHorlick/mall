/**
 * 上传相关 API 出口。
 * 实现集中在 client.uploadImage，避免页面直接拼 FormData/fetch。
 */
export { uploadImage, type UploadImageResult } from './client.ts'
