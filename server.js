/* 
==================================
1 PARTE - CONFIGURAÇÃO DO SERVIDOR
==================================
*/

require("dotenv").config(); // carrega as variáveis do arquivo .env
const pool = require("./db.js"); // importa a conexão com o banco de dados

// 1 - Inporta o Express - ele cria e gerencia o nosso servidor
const express = require("express");

// 2 - Importa o CORS - permite que o navegador "converse" com o servidor (frontend - backend)
const cors = require("cors");

// 3 - Cria o servidor (como ligar um computador)
const app = express();

// 4 - Ativa o CORS - libera a comunicação entre o front-end e o back-end
app.use(cors());

// 5 - Ativa o leitor de JSON - permite entender os dados recebidos
// sem isso, o servidor não consegue ler o  que o formulário envia
app.use(express.json());


/* 
==================================
2 PARTE - CRIAÇÃO DAS ROTAS E INÍCIO
==================================
*/

// 6. Define a rota POST "/mensagem"
// Quando o form enviar os dados para /mensagem, essa função roda
app.post("/mensagem", (req,res) => {
    // 7. req.body contém os dados envciados pelo form(nome,email,mensagem)
    try{
        const nome = req.body.nome
        const email = req.body.email
        const mensagem = req.body.mensagem
        
        if(!nome || !email || !mensagem){
            // codigo 400 - requisição inválida
            return res.status(400).json({mensagem: "Preecha todos os campos"});
        };

        pool.execute("INSERT INTO tb_mensagem(nome,email,mensagem) VALUES(?,?,?)",
                    [nome,email,mensagem]);

        // codigo 201 - criado com sucesso
        res.status(201).json({mensagem: "Mensagem enviada com sucesso!"});

        // 8. Envia uma resposta de volta para o navegador
        res.send("Mensagem recebida com sucesso!");
    } catch(error){
        console.error(error);
    }
});

// 9. Inicia o servidor na porta 3000
// Depois disso, o servidor fica "ouvindo" por novas mensagens
app.listen(3000, ()=>{
    console.log("Servidor rodando em http://localhost:3000");
});
