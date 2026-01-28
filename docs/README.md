# Auto Body Shop - Leads Backend System

A robust backend system for managing customer leads from your auto body shop website. Features include email notifications, auto-responses, spam protection, rate limiting, and photo uploads.

## Features

- Lead submission with form validation
- Email notifications to shop owner
- Auto-reply confirmation emails to customers
- Photo upload support (up to 3 photos per lead)
- Honeypot spam detection
- Rate limiting (20 requests per 15 minutes)
- Input sanitization for security
- MongoDB storage for all leads
- Environment-aware error handling

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Nodemailer for email
- Multer for file uploads
- Express Rate Limit for rate limiting

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

- `MONGO_URI` - Your MongoDB connection string
- `SMTP_HOST` - SMTP server host (e.g., smtp.gmail.com)
- `SMTP_PORT` - SMTP server port (usually 587)
- `SMTP_USER` - Your email address for sending emails
- `SMTP_PASS` - Your email password or app password
- `OWNER_EMAIL` - Email address where leads will be sent
- `CORS_ORIGIN` - Frontend domain (use * for development)
- `PORT` - Server port (default: 5000)

### 3. Set Up MongoDB

Make sure MongoDB is running locally or use a cloud service like MongoDB Atlas.

### 4. Run the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/leads

Submit a new lead.

**Request Body (multipart/form-data):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "message": "I need a quote for my car repair",
  "damageDescription": "Front bumper damage",
  "photos": [File, File, File],
  "company": "" // Honeypot field - should be empty
}
```

**Response:**
```json
{
  "message": "Lead submitted successfully"
}
```

**Validation Rules:**
- `name`: minimum 2 characters
- `email`: must contain @
- `phone`: minimum 7 characters
- `message`: minimum 10 characters
- `photos`: max 3 files, 5MB each, images only
- `company`: honeypot field (must be empty)

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok"
}
```

## Security Features

1. **Input Sanitization** - Removes potentially harmful characters from user input
2. **Rate Limiting** - Prevents abuse by limiting requests per IP
3. **Honeypot Field** - Silently rejects bot submissions
4. **File Upload Restrictions** - Only allows images up to 5MB
5. **CORS Configuration** - Restricts API access to your domain
6. **Environment-Aware Errors** - Hides sensitive error details in production

## Email Templates

The system sends two types of emails:

1. **Lead Notification (to shop owner)** - HTML formatted email with all lead details
2. **Auto-Reply (to customer)** - Confirmation email thanking them for their inquiry

Both emails include professional HTML templates with inline CSS.

## Database Schema

**Lead Model:**
```typescript
{
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos?: string[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
```

## Project Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── leadControllers.ts    # Lead submission logic
│   ├── middlewares/
│   │   ├── errorHandler.ts       # Global error handling
│   │   └── upload.ts              # File upload configuration
│   ├── models/
│   │   └── Lead.ts                # MongoDB Lead schema
│   ├── routes/
│   │   └── leadRoutes.ts          # API routes
│   ├── utils/
│   │   └── email.ts               # Email service
│   ├── validators/
│   │   └── leadValidators.ts      # Input validation
│   ├── app.ts                     # Express app setup
│   └── server.ts                  # Server entry point
├── uploads/                       # Uploaded photos directory
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Future Enhancements

- [ ] Dashboard for viewing/managing leads
- [ ] Lead status tracking (new, contacted, closed)
- [ ] Email verification
- [ ] SMS notifications
- [ ] Lead analytics
- [ ] Auto-cleanup of old photos
- [ ] Database indexes for better performance
- [ ] Unit and integration tests

## Troubleshooting

**Email not sending:**
- Check SMTP credentials in .env
- For Gmail, use an App Password (not your regular password)
- Verify SMTP_PORT is correct (587 for TLS, 465 for SSL)

**File upload not working:**
- Ensure `uploads/` directory exists
- Check file size (max 5MB per file)
- Verify file type is an image

**MongoDB connection error:**
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Verify network access if using MongoDB Atlas

## License

ISC
