"use server";

import { defaultBucket } from "./config";

export const getSignedURL = async (fileName: string) => {
  try {
    const [signedURL] = await defaultBucket.file(fileName).getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return signedURL;
  } catch (error) {
    return null;
  }
};

export const getFileMetadata = async (fileName: string) => {
  try {
    const [metaData] = await defaultBucket.file(fileName).getMetadata();

    return { mimeType: metaData.contentType };
  } catch (error) {
    return null;
  }
};

export const getUploadURL = async (fileName: string, mimeType = "application/octet-stream") => {
  try {
    const [signedURL] = await defaultBucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: mimeType,
    });

    return signedURL;
  } catch (error) {
    return null;
  }
};

export const deleteFiles = async (objectIds: string[]) => {
  return await Promise.all(objectIds.map((objectId) => defaultBucket.file(objectId).delete()));
};
