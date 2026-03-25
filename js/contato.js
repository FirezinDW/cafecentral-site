const form = document.getElementById("formContato");

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nome = document.getElementById("Nome").value;
    const email = document.getElementById("Email").value;
    const mensagem = document.getElementById("Mensagem").value;

    const novaMensagem = {
        nome: nome,
        email: email,
        mensagem: mensagem
    };

    try{
        const resposta = await fetch("http://localhost:3000/mensagem",
            {
            method:"POST", 
            headers: {
                "Content-Type": "aplication/json" 
            },
            body: JSON.stringify(novaMensagem)
            }
        );
        const dados = await resposta.text();

        alert(dados);
        form.reset();

    }catch(erro){
        alert(`Erro: ${erro}`);
    }

})