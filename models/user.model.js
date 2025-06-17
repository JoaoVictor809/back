module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    name: {
      type: Sequelize.STRING
    },
    cpf: {
      type: Sequelize.STRING,
      unique: true
    },
    endereco: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    data_nascimento: {
      type: Sequelize.DATEONLY
    },
    password: {
      type: Sequelize.STRING
    }
  });

  return User;
};
