/*============================================================
    1) PEGAR OS ELEMENTOS DO HTML
  ============================================================
*/
//ONDE OS CARDS VAO APARECER
const ListaCursos = document.querySelector("#ListaCursos");
//CAMPO DE BUSCA
const buscaCursos = document.querySelector("#BuscarCursos")
/*============================================================
    2)CRIAR UMA LISTA PARA GUARDAR OS CURSOS
  ============================================================
*/
let cursos = [];
/*============================================================
    3) FUNÇÃO PARA CARREGAR O JSON
  ============================================================
*/

async function carregarCursos(){
    //BUSCA O ARQUIVO cursos.json
    const resposta = await fetch("../data/cursos.json"); 
    console.log(resposta);

    //transforma o JSON em dados que o js entende
    cursos = await resposta.json();

    //depois de caregar, já renderiza na tela
    renderizarCursos(cursos);
};

/*============================================================
    4) FUNÇÃO PARA CRIAR OS CARD DOS CURSOS NA TELA
  ============================================================
*/
function renderizarCursos(lista){
    // limpa o conteúdo antes de desenhar de novo
    ListaCursos.innerHTML = "";

    // para cada curso da lista -> cria um card
    lista.forEach(curso => {
        // cria a tag div
        const card = document.createElement("div");

        // coloca uma class dentro da tag criada
        card.classList.add("card");

        //coloca o conteúdo dentro do card
        card.innerHTML = `
            <h3> ${curso.titulo} </h3>
            <img src="${curso.img}" width="150" height="150">
            <p> ${curso.descricao} </p>
            <p> <strong>CH: </strong> ${curso.ch}</p>
            <a href="${curso.url}"><button>Ver detalhes</button></a>
        `;
        ListaCursos.appendChild(card);
    });
}


/*============================================================
    5) FUNÇÃO PARA BUSCA DE CURSO
  ============================================================
*/
// Chamar uma função que captura a ação do usuário e dispara um evento
buscaCursos.addEventListener("input", function(){
  // Pega o valor digitado
  const texto = buscaCursos.value.toLowerCase(); // pega o valor digitado no input e deixa tudo minúsculo

  const filtrados = cursos.filter((curso) => 
    // Para cada CURSO:
  // curso.titulo -> acesso título (chave JSON)
  // toLowerCase() -> padroniza comparação
  // includes(texto) -> verifica se o texto digitado está dentro do título
  // retorna true (entra no filtro) ou false (e ignorado)
    curso.titulo.toLowerCase().includes(texto)
  
  )

// Reenderizar a tla com novalista filtrada
renderizarCursos(filtrados);
});




/*============================================================
    6) INICIA TUDO
  ============================================================
*/
carregarCursos();