require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require('express-rate-limit');
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
const errorHandler = require('./middlewares/errorHandler');



const config = require("./config");

const app = express();

const server = http.createServer(app);
const io = new Server(server,{ 
  cors: {
    origin: config.frontUrl
  }
});

io.on("connection", (socket) => {
  socket.on("sendMessage", (data) => {
    console.log(data);
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
  console.log("a user connected.");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    console.log(user);
    io.emit("getMessage", {
      senderId,
      text,
    });
  });

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Configuration des cookies
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes, veuillez réessayer dans 15 minutes',
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for'] || 'unknown';
  },
  skip: () => process.env.NODE_ENV === 'development'
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
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Adopte un Étudiant - Documentation",
  customfavIcon: "/assets/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
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

// Configuration Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
      cb(null, req.body.name);
    } else {
      return cb(new Error('Invalid mime type, try only pdf, jpeg, png, jpg'));
    }
  },
});

const upload = multer({ storage: storage });

app.post("/api/uploads", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    console.error(error);
  }
});

// Routes API
app.use("/api/messages", authMiddleware, messagesRouter);
app.use("/api/conversations", authMiddleware, conversationsRouter);
app.use("/api/adoptions", authMiddleware, adoptionsRouter);
app.use("/api/contracts", authMiddleware, contractsRouter);
app.use("/api/jobOffers", jobOffersRouter);
app.use("/api/jobApplications", jobApplicationsRouter);
app.use("/api/users", userRouter);
app.post("/api/login", usersController.login);
app.use("/api/domains", domainRouter);
app.use("/api/searchTypes", searchTypeRouter);

// Servir le frontend pour toutes les autres routes
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});


app.use(errorHandler);

module.exports = {
  app,
  server,
};
