import express from 'express';
import videoService from '@/main/services/video';
import { FileRequest } from '@/main/middlewares/multer';
import { responseHandler } from '@/main/utils/handler';

const USER_ID = 1; // FIXME: token authorization

export const uploadVideo = async (
  req: FileRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const url: string = await videoService.upload(req.file);
    responseHandler(res, 200, { url });
  } catch (err) {
    next(err);
  }
};

export const downloadVideo = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {};

export const getVideoList = async (
  req: express.Request,
  res: express.Response
  // next: express.NextFunction
) => {
  try {
    const videoList = await videoService.getByUser(USER_ID); // FIXME
    responseHandler(res, 200, { videoList });
  } catch (err) {
    console.log(err);
  }
};
