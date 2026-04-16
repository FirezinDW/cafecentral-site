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
    "http://localhost:5501", // ambiente local (live server)
    "http://127.0.0.1:5501", // variação de localhost
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
    name: "cafecentral-1-site.sid", 
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

/* 
===============================================
2 PARTE - CRIAR ROTA E INICIAR
===============================================
*/
// 1. Define a rota POST "/mensagem"
// Quando o formulário enviar os dados para /mensagem, essa função roda
app.post("/mensagem", async (req,res) => {
    try{
     //7. req.body contém os dados enviados pelo formulário
        //(nome,email, mensagem)
    const nome = req.body.nome;
    const email = req.body.email;
    const mensagem = req.body.mensagem;

    if(!nome || !email || !mensagem){
        return res.status(400).json({mensagem: "Preencher todos os campos"});
    }

    // 9 - faz o comando SQL de insercao
    await pool.execute("INSERT INTO tb_mensagem(nome_mensagem,email_mensagem,mensagem_mensagem) VALUES(?,?,?)",
            [nome,email,mensagem]);

    // 10 - O servidor envia uma mensagem de volta no formato JSON
    res.status(201).json({mensagem: "Mensagem enviada com sucesso"});

    //11. Envia uma mensagem de volta para o navegador
    res.send("Mensagem recebida com sucesso!");
    } catch(erro){
        console.error(error);
        return res.status(500).json({ mensagem: "Erro interno no servidor" });
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
            "SELECT id_usuario FROM tb_usuario WHERE email=?",[email] 
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

// 3. Define a rota POST "/login"
// aponta para login.html
app.post("/login", async (req,res) => {
    try{
        //const email = req.body.email
        //const senha = req.body.senha

        const {email,senha} = req.body // forma desestruturada

        if(!email || !senha ){
            return res.status(400).json({erro:"Preencha todos os campos"});
        }

        // Crio um array[rows] e guardo dentro o resultado do select
        const [rows] = await pool.execute(  //consulta no banco
            "SELECT id_usuario, nome_usuario, email_usuario, senha_usuario FROM tb_usuario WHERE email=?",[email] 
                //busca se o e-mail existe no banco e retorna o id
        );

        if(rows.length == 0){
            // retorna 401 se não achar usuário com esse e-mail
            return res.status(401).json({erro: "Usuário não encontrado"});
        };

        const usuario = rows[0] // pega o primeiro (e único) resultado de consulta

        // descriptografa a senha e guarda dentro da variável
        const senhaCorreta = await bcrypt.compare(senha,usuario.senha)
            // compara a senha digitada com a senha hash salvo no banco (true/false)

        if(!senhaCorreta){
            // senha hash for diferente da senha digitada
            return res.status(401).json({erro: "Senha inválida"});
            // 401 - acesso não autorizado
        };

        req.session.usuario = {
            // cria a sessão no servidor com os dados do usuário
            id: usuario.id, // ID interno do usuário
            nome: usuario.nome, // nome para exibir na interface
            email: usuario.email // email para referência futura
        }

        res.json({mensagem:"Login realizado com sucesso!"});
        // status=200
    } catch(error){
        // retorna 500 se o servidor não conseguir cadastrar
        console.error(error); // aparece no terminal pro dev
        res.status(500).json({erro: "Erro ao fazer login"})
    }
})

// 4. Define a rota get "/me" - verificar sessão
app.get("/me", (req, res) => {
    if(!req.session.usuario){ // se não há sessão salva
        return res.status(401).json({logado:false});
        // avisa que não está logado
    }

    res.json({
        logado:true, // confirma que está logado
        usuario: req.session.usuario 
            // devolve os dados do usuário (nome,email,id)
    })
});

// 5. Define a rota post "/logout" - encerrar sessão
app.post("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("cafecentral.sid")
        res.json({mensagem: "Logout realizado"});
    });
});



// 9. Inicia o Servidor na PORTA 3000
// Depois, o servidor fica "ouvindo" por novas mensagens
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});