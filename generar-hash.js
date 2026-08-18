const bcrypt = require("bcrypt");

const passwordPlano = "Pantana1";
const saltRounds = 10;

bcrypt.hash(passwordPlano, saltRounds).then((hash) => {
  console.log("Hash generado:", hash);
});
