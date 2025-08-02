const {NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } = require('../../utils/errors/');
const jwt = require("jsonwebtoken");
const config = require("../../config");
const usersService = require("./users.service");
const logger = require('../../utils/logger');
const LogMetadata = require('../../utils/logMetadata');
const PerformanceTracker = require('../../utils/performance');


class UsersController {
  async getAll(req, res, next) {
    try {
      logger.info('Fetching all users', LogMetadata.createRequestContext(req));

      const users = await PerformanceTracker.measureApiOperation(
        req,
        () => usersService.getAll(),
        'GET_ALL_USERS'
      );

      logger.info('Users retrieved successfully',
        LogMetadata.createBusinessContext('USERS_RETRIEVED', {
          userCount: users.length,
          operation: 'getAll'
        }, req)
      );

      res.json(users);
    } catch (err) {
      logger.error('Error fetching all users',
        LogMetadata.createErrorContext(err, req, { operation: 'getAll' })
      );
      next(err);
    }
  }
  async getStudents(req, res, next) {
    try {
      const users = await usersService.getStudents();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
  async getById(req, res, next) {
    try {
      const id = req.params.id;
      const user = await usersService.getById(id);
      if (!user) {
        throw new NotFoundError();
      }
      res.json(user);
     
    } catch (err) {
      next(err);
    }
  }
  async getByEmail(req, res, next) {
    try {
      const email = req.params.email;
      const user = await usersService.getByEmail(email);
      if (!user) {
        throw new NotFoundError();
      }
      res.json(user);
     
    } catch (err) {
      next(err);
    }
  }
  async getByDomain(req, res, next) {
    try {
      const domain = req.params.domainId;
      const user = await usersService.getByDomain(domain);
      if (!user) {
        throw new NotFoundError();
      }
      res.json(user);
     
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      logger.info('User creation initiated',
        LogMetadata.createBusinessContext('USER_CREATE_ATTEMPT', {
          email: req.body.email ? req.body.email.substring(0, 3) + '***' : 'missing',
          isStudent: req.body.isStudent,
          isCompany: req.body.isCompany
        }, req)
      );

      const user = await PerformanceTracker.measureApiOperation(
        req,
        () => usersService.create(req.body),
        'CREATE_USER'
      );

      user.password = undefined;

      logger.info('User created successfully',
        LogMetadata.createBusinessContext('USER_CREATED', {
          userId: user._id,
          userType: user.isStudent ? 'student' : (user.isCompany ? 'company' : 'admin'),
          email: user.email.substring(0, 3) + '***'
        }, req)
      );

      req.io.emit("user:create", user);
      res.status(201).json(user);
    } catch (err) {
      logger.error('Error creating user',
        LogMetadata.createErrorContext(err, req, {
          operation: 'create',
          email: req.body.email ? req.body.email.substring(0, 3) + '***' : 'missing'
        })
      );
      next(err);
    }
  }
  async update(req, res, next) {
      try {
       
        if (req.body.id == req.params.id || req.user.isAdmin){
          const id = req.params.id;
          const data = req.body;
          const userModified = await usersService.update(id, data);
          userModified.password = undefined;
          res.json(userModified);
        }
        else {
          return res.status(403).json("You can update only your account!");
        }
      } catch (err) {
        next(err);
      }
   
  }
  async delete(req, res, next) {
    if (req.user.id == req.params.id || req.user.isAdmin) {
      try {
        const id = req.params.id;
        await usersService.delete(id);
        req.io.emit("user:delete", { id });
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    } 
    else {
      return res.status(403).json("You can delete only your account!");
    }
  }
  async login(req, res, next) {
    const timer = PerformanceTracker.startTimer('USER_LOGIN',
      LogMetadata.createRequestContext(req)
    );

    try {
      const { email, password } = req.body;

      logger.info('Login attempt initiated',
        LogMetadata.createAuthContext('LOGIN_ATTEMPT', req, {
          email: email ? email.substring(0, 3) + '***' : 'missing',
          hasPassword: !!password
        })
      );

      if (!email || !password) {
        logger.warn('Login failed: Missing credentials',
          LogMetadata.createAuthContext('LOGIN_MISSING_CREDENTIALS', req, {
            missingEmail: !email,
            missingPassword: !password
          })
        );
        throw new ValidationError('Email and password are required');
      }

      const userId = await PerformanceTracker.measureDbQuery(
        'find', 'users',
        () => usersService.checkPasswordUser(email, password),
        { operation: 'password_verification', email: email.substring(0, 3) + '***' }
      );

      if (!userId) {
        logger.warn('Login failed: Invalid credentials',
          LogMetadata.createAuthContext('LOGIN_INVALID_CREDENTIALS', req, {
            email: email.substring(0, 3) + '***',
            attemptTime: new Date().toISOString()
          })
        );
        throw new UnauthorizedError('Invalid email or password');
      }

      const user = await PerformanceTracker.measureDbQuery(
        'findById', 'users',
        () => usersService.getById(userId),
        { userId }
      );

      const token = jwt.sign({ userId }, config.secretJwtToken, {
        expiresIn: "3d",
      });

      // Remove sensitive data before logging
      const userForLogging = {
        id: user._id,
        email: user.email,
        isStudent: user.isStudent,
        isCompany: user.isCompany,
        isAdmin: user.isAdmin
      };

      logger.info('Login successful',
        LogMetadata.createAuthContext('LOGIN_SUCCESS', req, {
          userId: user._id,
          userType: user.isStudent ? 'student' : (user.isCompany ? 'company' : 'admin'),
          tokenExpiry: '3d',
          loginTime: new Date().toISOString()
        })
      );

      timer.stop({ success: true, userId: user._id });

      res.json({
        token,
        user
      });
    } catch (err) {
      timer.stop({ success: false, error: err.message });

      logger.error('Login error',
        LogMetadata.createErrorContext(err, req, {
          loginAttempt: true,
          email: req.body.email ? req.body.email.substring(0, 3) + '***' : 'missing'
        })
      );

      next(err);
    }
  }

 


  async addfavoris(req, res, next){
    try {
      const currentUser = await usersService.getById(req.body.id);
      if (!currentUser.favoris.includes(req?.params?.id)) {
        await currentUser.updateOne({ $push: { favoris: req.params.id } });
        res.status(200).json("user has been add to favoris");
      } else {
        res.status(403).json("you allready have this user in favoris");
      }
    } catch (err) {
      next(err);
    }

}

async unfavoris(req, res, next){

    try {
      const currentUser = await usersService.getById(req.user.id);
      if (currentUser.favoris.includes(req.params.id)) {
        await currentUser.updateOne({ $pull: { favoris: req.params.id } });
        res.status(200).json("user has been removed from favoris");
      } else {
        res.status(403).json("you don't add this user in favoris");
      }
    } catch (err) {
      next(err);
    }

}


async favoris(req, res, next){

  try {
      const id = req.params.companyId;
      const user = await usersService.getById(id);
      const favoris = await Promise.all(
        user.favoris.map((studentsId) => {
          return usersService.getById(studentsId);
        })
      );
      let studentsList = [];
      favoris.map((student) => {
        const { _id, firstname,lastname, profilePicture, domain, searchType } = student;
        studentsList.push({ _id, firstname,lastname, profilePicture, domain , searchType });
      });
      res.status(200).json({ favoris })
    
  } catch (err) {
    next(err);
  }
}
}

module.exports = new UsersController();
