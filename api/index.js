const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { google } = require('googleapis');
const stream = require('stream');
const fetch = require('node-fetch');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Service Account Configuration (hardcoded)
const SERVICE_ACCOUNT = {
  "type": "service_account",
  "project_id": "eduguru-drive",
  "private_key_id": "c85d71980394615f4b3e408f8a6dd1ff26c8bfc6",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/xlgJ4Dd4kbM9\nf9GdA2FxeAJ23qcGLl/utarpTfkbbHRYKxHqPtbSyJiITLcIWW5B9xZ+hcdkvskf\noYaUOms6l2A0hLqATJEwLJyXo4zvMT/9h+cK97XQ24eDp6lEYKl7/xY4fOLq+kJu\nepelE1Z0HcbGe0zPxfVMiMLtmVikv8y1tKugB7hu0Tsoa88azW+gzmovC4lN0nyb\nqTfEL7/isIQn3YNEmMdDHom3gHdBAvdcOgRcfMbu30mfFKDmj8WI6GyqOeEdUB5U\nkXIxqYhOpypSxKzcRLnanpg+b9D5NIyo9U9Mfviby17/XmFLAkv5X/KXXdWWLdnA\n/y1a1YhxAgMBAAECggEAAnaP9WqDk+EdMf5FCTT8qKovr+qqrwXj9gsvy4jUmQFS\n2joNZBqUBEeOy/teQ3VwmNjNWWkq9zSLHUSkF53LeEhu9CW7RoAVQk7kYP85BW52\nwbEf6tBlLa5QJoT+A9KRArZzSNzzxixaM5SQA48Exn+GaNC3GxkSDj5YcJhOXulR\nDNHWwBBasaRrLIEv+oyd22TPEnXsN+YRt1Wvwieb3rvRkGxYScrmWbp6PYm8Q5y/\nVvjQKflgkoes3pBVSVyFmlS7rUgmMmPjSJ2st9Ul98wJHrTzn6p+9owerG7O5b6C\nYLYkKDkzVX+LRfPDAEmiQ1I+h6+JCNANlolO+Gv9gQKBgQDgayBLCH5JjlXiQNUM\n3pBLlyBBPYQtnGuO0lZhGCzqzKZ3SJfTdPCvX87ko9hsG2r9T7J3+4Qly31TjqWk\nsileiJCDkaNTefJDd0QvWBhAX0iqJM1oGdgrMPfFdVV5Ygc2O8tf1Vlh6QVelgi5\nAD9A4v/oVL/Njsc/cux4GYZnIQKBgQDawzNDWWMI18ep03uLWB0Vb72uTDyQcADI\naGmLOGgZfKAMCc1Df+r1QRxooGYvFI8YeJnBNbJJHwyvDbX39rhgNAThkHew1DrA\nVAAjmTV+sdusvJSN8UypG9OdeJcpk0B16Z9eb/eSYU3dSSmSrxVLbJfkkdKnlyad\nKr/oM90HUQKBgQDfA7Ygunz9TdQtNi5CTr5oT/N+wcojpWkBkibC8EpavyrCKUKv\noWs5bGVmsyf0Lr8Aof2B3FFzWaferEgRxfb0eZPbG5SJ9Qp6XwBEaDAZcFb+tfnl\n9KDsMwpWkIZzTKZMD9nID3V2piFu4HwklIlHSw3ybJ36gWOhuuwhYYQ94QKBgQCx\nSNXnc64tgWk+uLN7ZooTUD4A3amLSClqQCugdrLuTLALcXoWhLjtzrluFOcaqmeY\n5kt8Z763QWFvEAZzEE+1LxLxlblZ5XRDXw/JyaSvqwWixCUDrxR4S6PADvU57Sql\nJBJSXxzcVNzcQylcxWTVfgjOZFq6FGVnozhovncWMQKBgFC9G/uFVfVPd8MPH9bQ\nVoMbwEbUXekYuQM3XnZZLxfsBkLQaJXdnjxpr4IJ2nNpVOE4qBtsSosEcC4LuE/c\nmL1S4nC6ykXnU7tKczjKv2x1iYycDyoCCLv0+zd/Wm4+ECc59MCZ51h4JIuxopxR\ntFguZowlxO2Ni/WLu7+bCNAz\n-----END PRIVATE KEY-----\n",
  "client_email": "eduguru@eduguru-drive.iam.gserviceaccount.com",
  "client_id": "101786932792372896721",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/eduguru%40eduguru-drive.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

const PARENT_FOLDER_ID = '1BFqwE2fk-IFAb3XgkVyq3vQf_F76xQYp';
const CHATGPT_KEY = "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";

// Google Drive setup
const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT,
  scopes: ['https://www.googleapis.com/auth/drive.file']
});
const drive = google.drive({ version: 'v3', auth });

// simple root to prevent 404 on the domain root
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'EduGuru backend is running' });
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { month, day, subject } = req.body;

    if (!file || !month || !day || !subject) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const path = [month, `Day ${day}`, subject];
    let parentId = PARENT_FOLDER_ID;

    for (let folderName of path) {
      const response = await drive.files.list({
        q: `'${parentId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)'
      });

      if (response.data && response.data.files && response.data.files.length > 0) {
        parentId = response.data.files[0].id;
      } else {
        const folder = await drive.files.create({
          resource: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
          },
          fields: 'id'
        });
        parentId = folder.data.id;
      }
    }

    const bufferStream = new stream.PassThrough();
    bufferStream.end(file.buffer);

    const uploadedFile = await drive.files.create({
      resource: {
        name: file.originalname,
        parents: [parentId]
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream
      },
      fields: 'id, name'
    });

    res.json({
      success: true,
      fileName: uploadedFile.data.name,
      fileId: uploadedFile.data.id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: String(error.message || error) });
  }
});

// Chat endpoint for ChatGPT
app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          'Authorization': 'Bearer ' + CHATGPT_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: message }],
          max_tokens: 200
        })
      }
    );

    const data = await response.json();
    const aiResponse = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content
      : "No response";

    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: String(error.message || error) });
  }
});

// export app for Vercel serverless
module.exports = app;
