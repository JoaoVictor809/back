const db = require("../models");
const config = require("../config/auth.config.js"); // Adicionado para JWT secret
const User = db.users; // Assuming db.users is the correct way to access the User model
const { body, validationResult } = require('express-validator'); // For input validation

// JWT e Bcrypt
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require('dotenv').config(); // Garante que o .env seja carregado para process.env.JWT_SECRET

exports.updateUser = async (req, res) => {
  // Get userId from the token (added by authJwt.verifyToken middleware)
  const userId = req.userId; 
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).send({ message: "Nome ou e-mail deve ser fornecido para atualização." });
  }

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "Usuário não encontrado!" });
    }

    // Prepare updates object
    const updates = {};
    if (name) {
      updates.name = name; // Assumindo que o campo no modelo é 'name' para o nome do usuário
    }
    if (email) {
      // Basic email validation (can be enhanced)
      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).send({ message: "Formato de e-mail inválido." });
      }
      updates.email = email;
    }

    // Update user
    await user.update(updates);

    // Respond with updated user data (excluding password)
    const { password, ...updatedUserData } = user.get({ plain: true }); 
    res.status(200).send({
      message: "Informações do usuário atualizadas com sucesso!",
      user: updatedUserData
    });

  } catch (err) {
    // Handle potential errors, e.g., email already in use if unique constraint is violated
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).send({ message: "E-mail já está em uso por outra conta." });
    }
    res.status(500).send({ message: err.message || "Ocorreu um erro ao atualizar as informações do usuário." });
  }
};

// Define validation rules (optional but good practice)
// These would typically be used as middleware in the route definition
exports.validateUpdateUser = [
  body('email').optional().isEmail().withMessage('Formato de e-mail inválido.'),
  body('name').optional().isString().notEmpty().withMessage('O nome não pode estar vazio.')
];

exports.getActivityCalendar = (req, res) => {
  const userId = req.userId; // Injected by authJwt.verifyToken middleware
  const { month } = req.query; // Get month from query parameters

  // Basic validation for month parameter (optional, can be enhanced)
  if (!month) {
    return res.status(400).send({ message: "Parâmetro 'month' é obrigatório." });
  }

  // Placeholder response
  res.status(200).send({
    message: "Activity calendar data fetched successfully (placeholder).",
    userId: userId,
    month: month,
    // TODO: Implement actual data fetching logic here
    calendarData: [] 
  });
};

exports.getUserProfile = async (req, res) => {
  const userId = req.userId; // Injected by authJwt.verifyToken middleware

  try {
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "Usuário não encontrado!" });
    }

    // Respond with user data (excluding password)
    const { password, ...userData } = user.get({ plain: true });
    res.status(200).send(userData);

  } catch (err) {
    res.status(500).send({ message: err.message || "Ocorreu um erro ao buscar o perfil do usuário." });
  }
};

// --- Funções de Autenticação Adicionadas ---

// Signup (Implementado)
exports.signup = async (req, res) => {
  try {
    const { name, email, password, cpf, endereco, data_nascimento } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).send({ message: "Nome, email e senha são obrigatórios." });
    }

    // Verificar se email já existe
    const existingUserByEmail = await User.findOne({ where: { email: email } });
    if (existingUserByEmail) {
      return res.status(409).send({ message: "Falha ao registrar. Email já está em uso." });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const existingUserByCpf = await User.findOne({ where: { cpf: cpf } });
      if (existingUserByCpf) {
        return res.status(409).send({ message: "Falha ao registrar. CPF já está em uso." });
      }
    }
    
    // Dados para o novo usuário
    const newUserInput = {
      name: name,
      email: email,
      password: bcrypt.hashSync(password, 8), // Hashear a senha
      cpf: cpf, // Será undefined se não fornecido, o que é ok
      endereco: endereco, // Será undefined se não fornecido
      data_nascimento: data_nascimento // Será undefined se não fornecido
    };

    // Remover chaves com valores undefined para não tentar inserir NULL em campos opcionais,
    // a menos que o modelo Sequelize os permita explicitamente como NULL.
    Object.keys(newUserInput).forEach(key => newUserInput[key] === undefined && delete newUserInput[key]);

    const user = await User.create(newUserInput);

    res.status(201).send({ message: "Usuário registrado com sucesso!", userId: user.id });

  } catch (err) {
    // Tratar erros de validação do Sequelize (ex: unique constraint)
    if (err.name === 'SequelizeUniqueConstraintError') {
      // err.errors é um array de objetos de erro, pegamos a mensagem do primeiro
      const field = err.errors && err.errors[0] ? err.errors[0].path : 'campo';
      const value = err.errors && err.errors[0] ? err.errors[0].value : 'valor';
      return res.status(409).send({ message: `Falha ao registrar. O ${field} '${value}' já está em uso.` });
    }
    // Outros erros
    console.error("Erro no signup:", err);
    res.status(500).send({ message: err.message || "Ocorreu um erro ao registrar o usuário." });
  }
};

// Signin (Implementado)
exports.signin = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ message: "Email e senha são obrigatórios." });
    }

    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(404).send({ message: "Usuário não encontrado." });
    }

    // Assume que o campo da senha no seu modelo User é 'password'
    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password 
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        token: null,
        message: "Senha inválida!",
      });
    }

    if (!config.secret) {
      console.error("JWT Secret não está definido! Verifique seu arquivo .env e config/auth.config.js");
      return res.status(500).send({ message: "Erro interno do servidor: configuração de autenticação ausente." });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: 86400, // 24 horas
    });

    // Assume que o campo de nome/username no seu modelo User é 'username'
    // Se for 'name' ou outro, ajuste user.username abaixo.
    res.status(200).send({
      id: user.id,
      username: user.username, 
      email: user.email,
      token: token,
      message: "Login bem-sucedido!"
    });

  } catch (err) {
    console.error("Erro no signin:", err);
    res.status(500).send({ message: err.message || "Ocorreu um erro durante o login." });
  }
};
