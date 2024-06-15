import { Request, Response } from "express";
import multer from "multer";
import { Readable } from "stream";
import { cloudinary } from "@/config"; // Adjust the path as needed

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadMiddleware = (req: Request, res: Response, next: Function) => {
  const middleware = upload.single("file");
  middleware(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      bufferStream.pipe(uploadStream);
    });

    res.status(200).json({ url: (result as any).secure_url });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while uploading the file" });
  }
};

export default uploadMiddleware;
