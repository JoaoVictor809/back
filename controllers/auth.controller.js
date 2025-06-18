const db = require("../models");
const User = db.users;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

exports.signup = async (req, res) => {
  try {
    const { name, cpf, endereco, email, data_nascimento, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);

    const user = await User.create({
      name,
      cpf,
      endereco,
      email,
      data_nascimento,
      password: bcrypt.hashSync(password, 8)
    })
    res.status(201).send({ message: "Usuário registrado com sucesso!" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).send({ message: "Usuário não encontrado!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Senha inválida!" });
    }

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: 86400 // 24 horas
    });

    res.status(200).send({ token });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
