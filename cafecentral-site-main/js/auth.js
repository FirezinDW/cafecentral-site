const formCadastro = document.getElementById("formCadastro");
const formLogin = document.getElementById("formLogin");

//URL da API LOCAL
const API_URL = "http://localhost:3000"
// Troque pelo URL do Render antes de publicar
// const API_URL = "url_render"

if(formCadastro){
    formCadastro.addEventListener("submit", async function(event){
        event.preventDefault(); // previne que a página recarregue
        
        // Captura cada campo do form
        const nome = document.getElementById("nome").value.trim();
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value;
        const confirmaSenha = document.getElementById("confirmasenha").value;
        
        const mensagem = document.getElementById("mensagemCadastro");
        mensagem.textContent=""; // Limpa mensagem anterior
        
        // Campo vazio -> interromper
        if(!nome || !email || !senha || !confirmaSenha){
            mensagem.textContent = "Preencha os campos";
            return
        }
        // Senhas diferentes -> interromper
        if(senha !== confirmaSenha){
            mensagem.textContent = "As senhas não coincidem";
            return
        }

        // ENVIO PARA O SERVIDOR/BANCO E RESPOSTA
        try{
            // POST com corpo em JSON
            const resposta = await fetch(`${API_URL}/cadastro`,
                {
                    method: "POST", // tipo da requisição(envio)
                    headers: {"Content-Type":"application/json"},
                        // tipo de arquivo enviado
                    body: JSON.stringify({nome,email,senha}) 
                        // converte o objeto JS em JSON e 
                            //coloca no corpo da mensagem
                }
            );

            // Lê a reposta como objeto JS
            const dados = await resposta.json();

            if(!resposta.ok){
                // mensagem (paragrafo do html embaixo do form) = mensagem sucesso ou de erro    
                mensagem.textContent = dados.mensagem || dados.erro;
                return
            }

            // Exibe a mensagem de acesso
            mensagem.textContent = dados.mensagem

            // sucesso -> limpa o formulário
            formCadastro.reset();

        }catch(error){
            console.error(error); // aparece no terminal pro dev
            // Servidor offline ou inacessível
            mensagem.textContent = "Erro ao conectar com o servidor";
        }
        
    })
}

if(formLogin){
    formLogin.addEventListener("submit", async function(event){
        event.preventDefault(); // previne que a página recarregue
        
        // Captura cada campo do form
        const email = document.getElementById("emailLogin").value.trim();
        const senha = document.getElementById("senhaLogin").value;
      
        
        const mensagem = document.getElementById("mensagemLogin");
        mensagem.textContent=""; // Limpa mensagem anterior
        
        // Campo vazio -> interromper
        if(!email || !senha){
            mensagem.textContent = "Preencha os campos";
            return
        }
        

        // ENVIO PARA O SERVIDOR/BANCO E RESPOSTA
        try{
            // POST com corpo em JSON
            const resposta = await fetch(`${API_URL}/login`,
                {
                    method: "POST", // tipo da requisição(envio)
                    headers: {"Content-Type":"application/json"},
                        // tipo de arquivo enviado
                    credentials: "include", //Necessário para o cookie da sessão funcionar
                    body: JSON.stringify({email,senha}) 
                        // converte o objeto JS em JSON e 
                            //coloca no corpo da mensagem
                }
            );

            // Lê a reposta como objeto JS
            const dados = await resposta.json();

            // Exibe a mensagem de acesso ou erro
            mensagem.textContent = dados.mensagem || dados.erro;

            // sucesso -> redirecionar para página cursos.html
            if(resposta.ok){
                window.location.href = "../pages/cursos.html";
            }

        }catch(error){
            console.error(error); // aparece no terminal
            // Servidor offline ou inacessível
            mensagem.textContent = "Erro ao conectar com o servidor"
        }
        
    })
}
