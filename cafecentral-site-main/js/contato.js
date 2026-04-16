/* 
===============================================
1 PARTE - CAPTURAR OS DADOS DO FORM NO HTML
===============================================
*/
// 1. Pega o formulário pelo ID que colocamos no HTML
const form = document.getElementById("formContato");

// 2. Chama função para ficar "ouvindo" o momento que o 
//usuário clicar no botão Enviar
form.addEventListener("submit", async function(event){
    // 3. Impedir que a página recarregue
        //(comportamento padrão da tag form)
    event.preventDefault(); 

    // 4. Lê e salva o que o usuário digitou em cada campo
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const mensagem = document.getElementById("mensagem").value;

    // 5. Agrupa os dados em um "objeto js"(como uma caixa organizadora)
    const novaMensagem = {nome, email, mensagem};

    /* 
    ===============================================
    2 PARTE - TRATAR E ENVIAR OS DADOS PARA O SERVIDOR
    ===============================================
    */
    try{
        // 6. Envia os dados para o servidor usando fetch()
        const resposta = await fetch("http://localhost:3000/mensagem",{
            method:"POST", // POST = estamos enviando dados
            headers: {
                "Content-Type":"application/json" // avisa que formato é JSON
            },
            body: JSON.stringify(novaMensagem) 
                // Converte o objeto para texto JSON
        });
        
        // 7. Lê a resposta que o servidor enviou de volta
        const dados = await resposta.text();
        
        // 8. Mostra a resposta para o usuário
        alert(dados);
        
        // 9.  Limpa os campos do formulário após o envio
        form.reset();
        
        
        }catch(erro){
            // 10. Se algo der errado, avisa o usuário
            alert(`Erro: ${erro}`);
        };
        
});



