/* 
===============================================
1 PARTE - CONFIGURAR O SERVIDOR
===============================================
*/
// Importar as credenciais do banco
require("dotenv").config();

// 1. Importar o Express - ele cria e gerencia o servidor
const express = require("express");

// 2. Importar o CORS - permite que o navegador "converse" com o servidor
const cors = require("cors");

// 3. Importa o session  que permite gerenciar sessões de usuario
const session = require("express-session");

// 4. Importa o bcryptjs - para criptografia e compara senhas
const bcrypt = require("bcryptjs");

// 5. Importa a conexão com o banco de dados
const pool = require("./db.js");

// 6. Cria o servidor (como ligar um pc por ex)
const app = express();

// 7. Cria uma lista de instância de conexões
const listOrigins = [
    "http://localhost:5500", // ambiente local (live server)
    "http://127.0.0.1:5500", // variação de localhost
    "https://FirezinDW.github.io" // dominio do frontend em produção
]

// 8. Ativa o CORS - libera a comunicação entre front-end e back-end
app.use(cors({
    origin:listOrigins, // só aceita requisições dessas origens
    credentials:true, // permite o envio de cookies entre domínios
    methods: ['GET', 'POST', 'PUT', 'DELETE','OPTIONS'], 
        // métodos permitidos
    allowedHeaders: ["Content-Type","Authorization"] //cabeçalhos aceitos
}));

// 9. Ativa o leitor de JSON - permite entender os dados recebidos
// Sem isso, o servidor não consegue ler o que o formulário envia
app.use(express.json());

//10. Configuração de Sessão (do navegador)
const sessionConfig = {
    secret: process.env.SESSION_SECRET,     
        // chave secreta para assinar o cookie
    resave: false, 
        // não salva a sessões se não houver mudança
    saveUninitialized: false, 
        // não cria sessão para usuários não logados
    name: "cafecentral.sid", 
        // nome personalizado do cookie da sessão
    cookie: {
        httpOnly : true, // bloqueia o acesso via JavaScript
        maxAge: 1000 * 60 * 60 // sessão expira em 1 hora (em mil)
    }
}

// 11. Separa o ambiente de teste(localhost) do de produção(Render)
if(process.env.NODE_ENV == "production"){ // ambiente de produção
    app.set("trust proxy",1), // confia no proxy do Render
    sessionConfig.cookie.sameSite = "none", // necessário para os cookies 
    sessionConfig.cookie.secure = true // cookie só trafega em https
} else{ // ambiente de desenvolvimento(teste)
    sessionConfig.cookie.sameSite="lax", // funciona em locahost sem HTTPS
    sessionConfig.cookie.secure = false // permite cookie sem HTTPS local
}

app.use(session(sessionConfig)) // configura a sessão no servidor

app.post("/mensagem", (req,res) => {
    try{
        const nome = req.body.nome
        const email = req.body.email
        const mensagem = req.body.mensagem
        
        if(!nome || !email || !mensagem){
            return res.status(400).json({mensagem: "Preecha todos os campos"});
        };

        pool.execute("INSERT INTO tb_mensagem(nome_mensagem,email_mensagem,mensagem_mensagem) VALUES(?,?,?)",
                    [nome,email,mensagem]);

        res.status(201).json({mensagem: "Mensagem enviada com sucesso!"});

        res.send("Mensagem recebida com sucesso!");
    } catch(error){
        console.error(error);
    }
});

// 2. Define a rota POST "/cadastro"
// aponta para cadastro.html
app.post("/cadastro", async (req,res) => {
    try{
        //const nome = req.body.nome
        //const email = req.body.email
        //const senha = req.body.senha

        const {nome,email,senha} = req.body // forma desestruturada

        if(!nome || !email || !senha ){
            return res.status(400).json({erro:"Preencha todos os campos"});
        }

        // Crio um array[rows] e guardo dentro o resultado do select
        const [rows] = await pool.execute(  //consulta no banco
            "SELECT id_usuario FROM tb_usuario WHERE email_usuario=?",[email] 
                //busca se o e-mail existe no banco e retorna o id
        );

        if(rows.length > 0){
            return res.status(409).json({erro: "E-mail já cadastrado"});
        };
        
        // criptografa a senha e guarda dentro da variável
        const senhaHash = await bcrypt.hash(senha,10);   
            //gera o hash da senha com custo 10(mais seguro)

        // Inserir os dados no banco de dados
        await pool.execute( // executa o INSERT no banco
            "INSERT INTO tb_usuario(nome_usuario,email_usuario,senha_usuario) VALUES(?,?,?)",
                        [nome,email,senhaHash] // substitui os ? pelos valores reais
        );
        // retorna 201 (criado com sucesso)
        res.status(201).json({mensagem:" Cadastro realizado com sucesso!"});
    } catch(error){
        // retorna 500 se o servidor não conseguir cadastrar
        console.error(error); // aparece no terminal pro dev
        res.status(500).json({erro: "Erro ao cadastrar usuário"})
    }
});

app.post("/login", async (req,res) => {
    try{

        const {email,senha} = req.body

        if(!email || !senha ){
            return res.status(400).json({erro:"Preencha todos os campos"});
        }

        const [rows] = await pool.execute(
            "SELECT id_usuario, nome-usuario, email_usuario, senha_usuario FROM tb_usuario WHERE email=?",[email] 

        );

        if(rows.length == 0){

            return res.status(401).json({erro: "Usuário não encontrado"});
        };

        const usuario = rows[0] 

        const senhaCorreta = await bcrypt.compare(senha,usuario.senha)


        if(!senhaCorreta){

            return res.status(401).json({erro: "Senha inválida"});

        };

        req.session.usuario = {
            id: usuario.id, 
            nome: usuario.nome, 
            email: usuario.email 
        }

        res.json({mensagem:"Login realizado com sucesso!"});

    } catch(error){

        console.error(error); 
        res.status(500).json({erro: "Erro ao fazer login"})
    }
})


app.get("/me", (req, res) => {
    if(!req.session.usuario){ 
        return res.status(401).json({logado:false});

    }

    res.json({
        logado:true,
        usuario: req.session.usuario 

    })
});

app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("cafecentral.sid")
        res.json({mensagem: "Logout realizado"});
    });
});



app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});

