require("dotenv").config();
const pool = require("./db.js");

const express = require("express");

const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

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

app.listen(300, ()=>{
    console.log("Servidor rodando em http://localhost:3000")
})

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

