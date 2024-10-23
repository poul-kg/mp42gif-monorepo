import express, { Request, RequestHandler, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 3000;

// Enable CORS for all origins
app.use(cors());

function hasMessage(err: any): err is { message: string } {
  return !!err && 'message' in err;
}

// Configure Multer for file upload handling
const upload = multer({
  dest: 'uploads/', // Folder where uploaded files are stored temporarily
  limits: { fileSize: 50 * 1024 * 1024 }, // Max file size: 50MB
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4 is allowed.'));
    }
  },
});

// wrap ffprobe into async func
function ffprobeAsync(filePath: string): Promise<ffmpeg.FfprobeData> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
}

async function validateVideo(filePath: string): Promise<string> {
  const metadata = await ffprobeAsync(filePath);
  const { width, height } = metadata.streams[0];
  const duration = metadata.format.duration;

  if (!width) {
    throw new Error('Unable to get video width');
  }

  if (!height) {
    throw new Error('Unable to get video height');
  }

  if (!duration) {
    throw new Error('Unable to get video duration');
  }

  // Check video resolution
  if (width > 1024 || height > 768) {
    throw new Error('Video resolution must not exceed 1024x768.');
  }

  // Check video duration
  if (duration > 10) {
    throw new Error('Video duration must not exceed 10 seconds.');
  }

  return 'Video is valid and can be processed.';
}

// Define the route handler type using RequestHandler
const convertHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const filePath = req.file.path;
  const outputFilePath = path.join('outputs', `${uuidv4()}.gif`);

  try {
    await validateVideo(filePath);
  } catch (error) {
    if (hasMessage(error)) {
      res.status(400).send(error.message);
    } else {
      console.log(error);
      res.status(400).send('Unknown server error');
    }
    return;
  }

  // Convert MP4 to GIF using ffmpeg
  ffmpeg(filePath)
    .outputOptions([
      '-vf', 'scale=-1:400', // Resize to 400px height, maintain aspect ratio
      '-r', '5',             // Set frame rate to 5 FPS
    ])
    .toFormat('gif')
    .on('end', () => {
      // Clean up the uploaded MP4 file after conversion
      fs.unlinkSync(filePath);
      res.download(outputFilePath, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          res.status(500).send('Error converting file.');
        }
        // Clean up the output GIF file after sending it
        fs.unlinkSync(outputFilePath);
      });
    })
    .on('error', (err) => {
      console.error('Error during conversion:', err);
      res.status(500).send('Error converting file.');
      fs.unlinkSync(filePath);
    })
    .save(outputFilePath);
};

// Route to handle file upload and conversion
app.post('/convert', upload.single('video'), convertHandler);

// Status route, for testing
app.get('/status', (req, res) => {
  console.log('Status request');
  res.status(200).send('OK');
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
