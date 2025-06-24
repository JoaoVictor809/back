const db = require("../models");
const User = db.users; // Assuming db.users is the correct way to access the User model, as seen in auth.controller.js
const { body, validationResult } = require('express-validator'); // For input validation

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
      updates.name = name;
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
