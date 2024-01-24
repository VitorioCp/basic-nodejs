const { hash, compare } = require("bcryptjs");
const AppError = require('../utils/AppError');
const sqliteConnection = require("../database/sqlite");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();

    const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso!");
    }

    const hashedPassword = await hash(password, 8);

    await database.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

    return response.status(201).json();

  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;
    const { id } = request.params;

    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError("Usuário nao encontrado");
    }

    const userWithUpdateEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

    if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso.");
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError("Você precisa informar a senha antiga para definir a nova senha");
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("A senha antiga nao confere.")
      }

      user.password = await hash(password, 8);
    }


    await database.run(`
    UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATeTIME( 'now')
    WHERE id = ?`,
      [user.name, user.email, user.password, new Date(), id]
    );

    return response.json();
  }

  async login(request, response) {
    const { email, password } = request.body;
    const database = await sqliteConnection();
    const user = await database.get(`SELECT email, password FROM users WHERE email = '${email}'`);

    if (!user) {
      return response.status(401).json({ error: "Deu merda1!" });
    } 
    
    // const hashedPassword = await hash(password, 8);
    const checkPassword = await compare(password, user.password);
    // console.log(checkPassword, hashedPassword);

    if (!checkPassword) {
      return response.status(401).json({ error: "Deu merda2!" });
    }

    
    return response.status(200);
  }
}
module.exports = UsersController; 