require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require('express-rate-limit');
const statusMonitor = require('express-status-monitor');
const multer = require("multer");
const path = require("path");
const userRouter = require("./api/users/users.router");
const usersController = require("./api/users/users.controller");
const authMiddleware = require("./middlewares/auth");
const domainRouter = require("./api/domains/domains.router");
const searchTypeRouter = require("./api/searchTypes/searchTypes.router");
const messagesRouter = require("./api/messages/messages.router");
const adoptionsRouter = require("./api/adoptions/adoptions.router");
const contractsRouter = require("./api/contracts/contracts.router");
const conversationsRouter = require("./api/conversations/conversations.router");
const jobOffersRouter = require("./api/jobOffers/jobOffers.router");
const jobApplicationsRouter = require("./api/jobApplications/jobApplications.router");
const cookieParser = require('cookie-parser');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const adminRouter = require('./api/admin/admin.router');
const monitoringRouter = require('./api/monitoring/monitoring.router');
const errorHandler = require('./middlewares/errorHandler');
const correlationIdMiddleware = require('./middlewares/correlationId');
const { enhancedMetricsMiddleware, trackSocketConnection, recordSocketMessage } = require('./middlewares/metricsMiddleware');
const logger = require('./utils/logger');
const LogMetadata = require('./utils/logMetadata');
const PerformanceTracker = require('./utils/performance');
const metricsCollector = require('./utils/metrics');

const config = require("./config");
const monitoringConfig = require("./config/monitoring");

const app = express();

// Configure express-status-monitor
const statusMonitorConfig = {
  title: 'Adopte un Étudiant - System Monitor',
  path: '/api/status',
  spans: [
    {
      interval: 1,     // Every second
      retention: 60    // Keep 60 datapoints (1 minute)
    },
    {
      interval: 5,     // Every 5 seconds
      retention: 60    // Keep 60 datapoints (5 minutes)
    },
    {
      interval: 15,    // Every 15 seconds
      retention: 60    // Keep 60 datapoints (15 minutes)
    }
  ],
  chartVisibility: {
    cpu: true,
    mem: true,
    load: true,
    responseTime: true,
    rps: true,
    statusCodes: true
  },
  healthChecks: []
};

app.use(statusMonitor(statusMonitorConfig));

const server = http.createServer(app);
const io = new Server(server,{ 
  cors: {
    origin: config.frontUrl
  }
});

io.on("connection", (socket) => {
  socket.on("sendMessage", (data) => {
    logger.debug("Socket message received", {
      socketEvent: 'MESSAGE_RECEIVED',
      dataLength: data ? JSON.stringify(data).length : 0,
      socketId: socket.id
    });
  });
});

// Gestion des utilisateurs Socket.IO
let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  logger.info("Socket.IO user connected", {
    socketEvent: 'CONNECTION',
    socketId: socket.id,
    ip: socket.handshake.address,
    userAgent: socket.handshake.headers['user-agent'],
    timestamp: new Date().toISOString(),
    activeConnections: users.length
  });

  socket.on("addUser", (userId) => {
    logger.info("User added to Socket.IO session", {
      socketEvent: 'ADD_USER',
      userId,
      socketId: socket.id,
      ip: socket.handshake.address,
      timestamp: new Date().toISOString(),
      previousActiveUsers: users.length
    });

    addUser(userId, socket.id);
    io.emit("getUsers", users);

    // Track Socket.IO metrics
    trackSocketConnection(socket, users);
    recordSocketMessage('addUser');

    logger.debug("Active users list updated", {
      socketEvent: 'USERS_LIST_UPDATED',
      activeUsers: users.length,
      timestamp: new Date().toISOString()
    });
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);

    logger.info("Real-time message sent", {
      socketEvent: 'SEND_MESSAGE',
      senderId,
      receiverId,
      messageLength: text ? text.length : 0,
      receiverOnline: !!user,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    io.emit("getMessage", {
      senderId,
      text,
    });

    // Record Socket.IO message metrics
    recordSocketMessage('sendMessage');
  });

  socket.on("disconnect", () => {
    logger.info("Socket.IO user disconnected", {
      socketEvent: 'DISCONNECT',
      socketId: socket.id,
      ip: socket.handshake.address,
      timestamp: new Date().toISOString(),
      activeConnectionsBefore: users.length
    });

    removeUser(socket.id);
    io.emit("getUsers", users);

    // Update Socket.IO metrics after user removal
    trackSocketConnection(socket, users);
    recordSocketMessage('disconnect');

    logger.debug("User removed from active list", {
      socketEvent: 'USER_REMOVED',
      socketId: socket.id,
      activeConnectionsAfter: users.length,
      timestamp: new Date().toISOString()
    });
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Add correlation ID tracking for all requests
app.use(correlationIdMiddleware);

app.use(enhancedMetricsMiddleware);

// Configuration des cookies
app.use(cookieParser());

// Rate limiting with enhanced logging
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes, veuillez réessayer dans 15 minutes',
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
  skip: () => process.env.NODE_ENV === 'development',
  handler: (req, res, next, options) => {
    logger.warn('Rate limit request blocked', {
      securityEvent: 'RATE_LIMIT_BLOCKED',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      limit: options.max,
      windowMs: options.windowMs,
      timestamp: new Date().toISOString()
    });

    res.status(options.statusCode).json({
      error: {
        status: options.statusCode,
        message: options.message
      }
    });
  }
});

app.use(limiter);

// Configuration de session avec MongoStore pour la production
const sessionConfig = {
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false, // Changé à false pour la sécurité
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
};

// Utiliser MongoStore en production
if (process.env.NODE_ENV === 'production' && config.mongoUri) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: config.mongoUri,
    touchAfter: 24 * 3600 // lazy session update
  });
}

app.use(session(sessionConfig));

// Swagger Documentation
// Serve the swagger.json file
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Serve Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Adopte un Étudiant - Documentation",
  customfavIcon: "/assets/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    url: '/api-docs/swagger.json'
  }
}));

// Admin routes BEFORE body-parser
app.use('/admin', adminRouter);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Servir les fichiers statiques du frontend
app.use(express.static(path.resolve(__dirname, "../frontend/build")));

app.use(cors());
app.use(express.json());
// Configure Helmet with CSP for AdminBro
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
);

// Configuration Multer with enhanced logging
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.debug('File upload destination set',
      LogMetadata.createFileContext('SET_DESTINATION', {
        destination: 'public/uploads',
        originalName: file.originalname,
        mimeType: file.mimetype
      }, req)
    );
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    logger.info('File upload validation initiated',
      LogMetadata.createFileContext('UPLOAD_VALIDATION', {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        allowedTypes: allowedMimeTypes
      }, req)
    );

    if (allowedMimeTypes.includes(file.mimetype)) {
      logger.info('File upload validation successful',
        LogMetadata.createFileContext('UPLOAD_VALIDATION_SUCCESS', {
          originalName: file.originalname,
          newName: req.body.name,
          mimeType: file.mimetype,
          size: file.size
        }, req)
      );
      cb(null, req.body.name);
    } else {
      logger.warning('File upload validation failed: Invalid mime type',
        LogMetadata.createFileContext('UPLOAD_VALIDATION_FAILED', {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          allowedTypes: allowedMimeTypes
        }, req)
      );
      return cb(new Error('Invalid mime type, try only pdf, jpeg, png, jpg'));
    }
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  }
});

/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Upload un fichier
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier à uploader (PDF, JPEG, PNG, JPG)
 *               name:
 *                 type: string
 *                 description: Nom du fichier
 *     responses:
 *       200:
 *         description: Fichier uploadé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "File uploaded successfully"
 *       400:
 *         description: Type de fichier invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/api/uploads", (req, res, next) => {
  const uploadTimer = PerformanceTracker.startTimer('FILE_UPLOAD',
    LogMetadata.createRequestContext(req)
  );

  upload.single("file")(req, res, (err) => {
    if (err) {
      uploadTimer.stop({ success: false, error: err.message });

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          logger.warn('File upload failed: File too large',
            LogMetadata.createFileContext('UPLOAD_SIZE_EXCEEDED', {
              error: err.message,
              limit: '2MB'
            }, req)
          );
          return res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
        }
      }

      logger.error('File upload error',
        LogMetadata.createErrorContext(err, req, {
          operation: 'file_upload',
          errorType: err.constructor.name
        })
      );

      return res.status(400).json({ error: err.message });
    }

    try {
      const uploadDuration = uploadTimer.stop({
        success: true,
        fileName: req.file ? req.file.filename : null,
        fileSize: req.file ? req.file.size : null
      });

      if (req.file) {
        logger.info('File uploaded successfully',
          LogMetadata.createFileContext('UPLOAD_SUCCESS', {
            originalName: req.file.originalname,
            savedName: req.file.filename,
            size: req.file.size,
            mimeType: req.file.mimetype,
            destination: req.file.destination,
            uploadDuration: `${uploadDuration.toFixed(2)}ms`
          }, req)
        );
      }

      return res.status(200).json("File uploaded successfully");
    } catch (error) {
      uploadTimer.stop({ success: false, error: error.message });

      logger.error('File upload processing error',
        LogMetadata.createErrorContext(error, req, {
          operation: 'file_upload_processing'
        })
      );

      return res.status(500).json({ error: 'Internal server error during file processing' });
    }
  });
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     description: Authentifie un utilisateur et retourne un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Données de connexion invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Email ou mot de passe incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post("/api/login", usersController.login);

// Routes API
app.use("/api/messages", authMiddleware, messagesRouter);
app.use("/api/conversations", authMiddleware, conversationsRouter);
app.use("/api/adoptions", authMiddleware, adoptionsRouter);
app.use("/api/contracts", authMiddleware, contractsRouter);
app.use("/api/jobOffers", jobOffersRouter);
app.use("/api/jobApplications", jobApplicationsRouter);
app.use("/api/users", userRouter);
app.use("/api/domains", domainRouter);
app.use("/api/searchTypes", searchTypeRouter);

// Monitoring and health check routes (should be accessible without auth)
app.use("/api", monitoringRouter);

// Servir le frontend pour toutes les autres routes
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});


app.use(errorHandler);

module.exports = {
  app,
  server,
};
