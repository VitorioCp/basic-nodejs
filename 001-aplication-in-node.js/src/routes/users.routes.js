const { Router } = require("express");

const UsersController = require("../controllers/UsersController");

const usersRoutes = Router();

function myMiddleware(request, response, next){
console.log("Você passou pelo middleware")

if(!request.body.isAdmin){
    return response.json({message: "User unautthorized"});
}

next();
}

const usersController = new UsersController();

usersRoutes.post("/", myMiddleware, usersController.create);

module.exports = usersRoutes;