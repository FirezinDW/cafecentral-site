require("dotenv").config() // carrega as variáveis do .env para process.env
const mysql = require("mysql2/promise") // importa o MySQL com suporte a async/await

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    ssl: {rejectUnauthorized: false}, //habilita a conexão segura com o Aiven via SSL
    waitForConnections: true, // se todas as coenexões tiverem ocupadas, aguarda na fila
    connectionLimit: 10 // máximo de conexões simultâneas
});


module.exports = pool; // exporta o pool para ser usado no server.js