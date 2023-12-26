const { Router } = require ("express");

const usersRouter = require("./users.routes");

const routes = Router();
Router.use("/users", usersRouter);

module.exports = routes;