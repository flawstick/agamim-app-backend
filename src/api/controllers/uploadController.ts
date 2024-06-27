import { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import assert from "assert";
import { Readable } from "stream";
import { cloudinary } from "@/config";
import { log } from "@/utils/log";

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

const CHUNKS_DIR = path.join(__dirname, "..", "chunks");

if (!fs.existsSync(CHUNKS_DIR)) {
  fs.mkdirSync(CHUNKS_DIR, { recursive: true });
}

const uploadMiddleware = (req: Request, res: Response, next: Function) => {
  const middleware = upload.single("file");
  middleware(req, res, (err: any) => {
    if (err) {
      log.error(`Multer error: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

const uploadChunk = (req: Request, res: Response) => {
  try {
    assert(req.file !== undefined, "File is undefined");
    const { file } = req;
    const { chunkIndex, fileName } = req.body;
    assert(chunkIndex !== undefined, "Chunk index is undefined");
    assert(fileName !== undefined, "File name is undefined");

    const chunkDir = path.join(CHUNKS_DIR, fileName);
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir, { recursive: true });
    }

    const chunkPath = path.join(chunkDir, chunkIndex);
    fs.writeFileSync(chunkPath, file.buffer);

    log.info(
      `Chunk ${chunkIndex} for file ${fileName} received and stored at ${chunkPath}`,
    );

    res.status(200).send("Chunk received");
  } catch (error) {
    log.error(`Error receiving chunk: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while receiving the chunk" });
  }
};

const completeUpload = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.body;
    assert(fileName !== undefined, "File name is undefined");

    const chunkDir = path.join(CHUNKS_DIR, fileName);
    const files = fs
      .readdirSync(chunkDir)
      .sort((a, b) => parseInt(a) - parseInt(b));

    const bufferStream = new Readable();
    for (const file of files) {
      const chunkPath = path.join(chunkDir, file);
      const data = fs.readFileSync(chunkPath);
      bufferStream.push(data);
      fs.unlinkSync(chunkPath);
    }
    bufferStream.push(null);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "uploads" },
        (error: any, result: any) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );
      bufferStream.pipe(uploadStream);
    });

    fs.rmdirSync(chunkDir);

    log.info(
      `File ${fileName} successfully uploaded to Cloudinary with URL: ${
        (result as any).secure_url
      }`,
    );

    res.status(200).json({ url: (result as any).secure_url });
  } catch (error) {
    log.error(`Error completing upload: ${error}`);
    res
      .status(500)
      .json({ error: "An error occurred while uploading the file" });
  }
};

export { uploadMiddleware, uploadChunk, completeUpload };
