const {NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } = require('../../utils/errors/');
const jwt = require("jsonwebtoken");
const config = require("../../config");
const usersService = require("./users.service");


class UsersController {
  async getAll(req, res, next) {
    try {
      const users = await usersService.getAll();
      res.json(users);
    } catch (err) {
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
      const user = await usersService.create(req.body);
      user.password = undefined;
      req.io.emit("user:create", user);
      res.status(201).json(user);
    } catch (err) {
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
    try {
      const { email, password } = req.body;
      const userId = await usersService.checkPasswordUser(email, password);
      if (!userId) {
        throw new UnauthorizedError();
      }
      const user = await usersService.getById(userId);
      const token = jwt.sign({ userId }, config.secretJwtToken, {
        expiresIn: "3d",
      });

      res.json({
        token,
        user
      });
    } catch (err) {
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
