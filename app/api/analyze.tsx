import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { runMiddleware } from '../../lib/middleware';
import { normalize } from '../../lib/normalize';
import { highlight } from '../../lib/highlight';
import { summarize } from '../../lib/summarize';
import type { VertexLog } from '../../lib/normalize';

// Define a custom request type that includes the file property
interface MulterRequest extends NextApiRequest {
  file: Express.Multer.File;
}

// Configure multer for in-memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Create middleware handler
const multerUpload = upload.single('file');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Block non-POST methods
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, multerUpload);
    
    // Cast req to MulterRequest to access the file property
    const multerReq = req as MulterRequest;
    
    // Check if file exists
    if (!multerReq.file || !multerReq.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse buffer to JSON
    let data;
    try {
      data = JSON.parse(multerReq.file.buffer.toString());
      
      // If root key 'Records' exists, replace with its array
      if (data.Records && Array.isArray(data.Records)) {
        data = data.Records;
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid JSON file' });
    }

    // Validate payload is an array
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Payload must be an array' });
    }

    // Process the logs
    const logs: VertexLog[] = normalize(data);
    const indices: number[] = highlight(logs);
    const summary: string = summarize(indices.map(i => logs[i]));

    // Return the processed data
    return res.status(200).json({ logs, indices, summary });
  } catch (error) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}