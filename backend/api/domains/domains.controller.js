const domainsService = require("./domains.service");

class DomainsController {

    async getAll(req, res, next) {
        try {
          const domains = await domainsService.getAll();
          res.json(domains);
        } catch (err) {
          next(err);
        }
      }

    async create(req, res, next){
        try {
            const domains = await domainsService.create(req.body);
            req.io.emit('domain:create', domains);
            res.status(201).json(domains);
            
        } catch (error) {
            next(error)
        }
    }

    async update(req, res, next){
            try {

            const id = req.params.id;
            const data = req.body;
            const domains = await domainsService.update(id, data);
            res.status(200).json(domains);
       
            } catch (error) {
                next(error)
            }
       
    }

    async delete(req, res, next){
        try {
            const id = req.params.id;
            await domainsService.delete(id);
            req.io.emit("domain:delete", { id })
            res.status(204).json({
                msg : "domain deleted successfuly"
            }).send();

        } catch (error) {
            next(error)
        }
    }

}

module.exports = new DomainsController()
