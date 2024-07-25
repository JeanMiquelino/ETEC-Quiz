// Variáveis globais
let perguntasDisponiveis = [];
let index = 0;
let pontuacao = 0;
let qtdePulos = 0;
let qtdeErros = 0;
let nivel = 'A';
let materiaSelecionada = 'C'; // Ajuste conforme necessário
let cronometroInterval; // Armazena o identificador do cronômetro
let tempoRestante = 60; // Define o tempo inicial em segundos para cada pergunta

// Função para carregar perguntas de um arquivo JSON
async function carregarPerguntas() {
  try {
    const response = await fetch('../dados/perguntas.json');
    if (!response.ok) {
      throw new Error(`Erro ao carregar o arquivo JSON: ${response.statusText}`);
    }
    const perguntas = await response.json();
    iniciarJogo(perguntas);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  // Chamar a função de carregamento de perguntas
  carregarPerguntas();

  var respostas = document.querySelectorAll('.resp1, .resp2, .resp3, .resp4');
  respostas.forEach(function(resposta) {
    resposta.addEventListener('click', function() {
      var radio = this.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
    });
  });
});

// Selecionar elementos do DOM
const h3Pergunta = document.getElementById('h3Pergunta');
const labelResposta01 = document.getElementById('labelResposta01');
const labelResposta02 = document.getElementById('labelResposta02');
const labelResposta03 = document.getElementById('labelResposta03');
const labelResposta04 = document.getElementById('labelResposta04');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnPular = document.getElementById('btnPular');
const btnParar = document.getElementById('btnParar');
const spanNivel = document.getElementById('spanNivel');
const spanPontuacao = document.getElementById('spanPontuacao');
const spanPulos = document.getElementById('spanPulos');
const spanErros = document.getElementById('spanErros');

// Função que inicializa o jogo com as perguntas carregadas
function iniciarJogo(perguntas) {
  // Verifique se os elementos DOM existem
  if (!h3Pergunta || !labelResposta01 || !labelResposta02 || !labelResposta03 || !labelResposta04) {
    console.error('Erro: Não foi possível encontrar um ou mais elementos DOM.');
    return;
  }

  // Definição de Eventos
  btnConfirmar.addEventListener('click', () => validarResposta(perguntas));
  btnPular.addEventListener('click', () => pular(perguntas));
  btnParar.addEventListener('click', () => parar());

  atualizarDadosPartida();
  sortear(perguntas);
}

// Definição de Funções
function validarResposta(perguntas) {
  let resp = retornarRespostaSelecionada();

  console.log('Resposta Selecionada:', resp);

  if (resp == null) {
    alert('Selecione uma resposta antes de confirmar!!!');
    return; // Retorna imediatamente se nenhuma resposta foi selecionada
  }

  if (resp.value == perguntasDisponiveis[index].CERTA) {
    alert('Parabéns... Você Acertou!!!');
    pontuacao++;

    if (pontuacao == 20) {
      alert('Parabéns... VOCÊ GANHOU!!!');
      window.location.href = "../../index.html"
    } else {
      nivel = pontuacao <= 4 ? 'A' :
              pontuacao <= 9 ? 'B' :
              pontuacao <= 14 ? 'C' :
              'D';
    }
  } else {
    let respostaCorreta = 
      perguntasDisponiveis[index].CERTA == 1 ? perguntasDisponiveis[index].RESP1 :
      perguntasDisponiveis[index].CERTA == 2 ? perguntasDisponiveis[index].RESP2 :
      perguntasDisponiveis[index].CERTA == 3 ? perguntasDisponiveis[index].RESP3 :
      perguntasDisponiveis[index].RESP4;

    alert(`Que Pena... Você Errou \nResposta Correta: ${respostaCorreta}`);
    qtdeErros++;

    if (qtdeErros == 3) {
      alert('Fim de Jogo!!!');
      window.location.href = "../../index.html"
    }
  }

  resp.checked = false;

  atualizarDadosPartida();
  sortear(perguntas);
}

function pular(perguntas) {
  qtdePulos++;
  if (qtdePulos == 3) {
    btnPular.disabled = true;
  }
    
  let resp = retornarRespostaSelecionada();
  if (resp != null) {
    resp.checked = false;
  }

  atualizarDadosPartida();
  sortear(perguntas);    
}

function atualizarDadosPartida() {
  tempoRestante = 60; // Reinicia o cronômetro para 60 segundos
  spanNivel.innerText = `Nível: ${nivel}`;
  spanPontuacao.innerText = `Pontos: ${pontuacao}`;
  spanPulos.innerText = `Pulos: ${qtdePulos}`;
  spanErros.innerText = `Erros: ${qtdeErros}`;
}

function iniciarCronometro(perguntas) {
  cronometroInterval = setInterval(function() {
    if (tempoRestante <= 0) {
      let resp = retornarRespostaSelecionada();
      // Tempo esgotado, faça algo (por exemplo, chame a função de validação)
      clearInterval(cronometroInterval);
      if (resp == null) {
        if (qtdePulos > 2) {
          alert('Fim de Jogo!!!');
          window.location.href = "../../index.html"
        } else {
          alert("O Tempo Acabou!!!")
          pular(perguntas);
        }
      } else {
        validarResposta(perguntas);
      }
    } else {
      // Atualize o cronômetro e exiba-o no elemento HTML
      const minutos = Math.floor(tempoRestante / 60);
      const segundos = tempoRestante % 60;
      const cronometroElement = document.getElementById('cronometro');
      cronometroElement.textContent = `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
      tempoRestante--;
    }
  }, 1000); // Atualize a cada segundo
}

function sortear(perguntas) {
  // Pare o cronômetro se estiver ativo
  clearInterval(cronometroInterval);
  
  // Inicie o cronômetro para a nova pergunta
  iniciarCronometro(perguntas);

  perguntasDisponiveis = perguntas.filter(pergunta => {
    return pergunta.MATERIA == materiaSelecionada &&
           pergunta.NIVEL == nivel &&
           pergunta.JA_FOI == 'N';
  });

  if (perguntasDisponiveis.length === 0) {
    console.error('Erro: Nenhuma pergunta disponível para o nível e matéria selecionados.');
    return;
  }

  index = Math.floor(Math.random() * perguntasDisponiveis.length);

  for (let idx = 0; idx < perguntas.length; idx++) {
    if (perguntas[idx].PERGUNTA == perguntasDisponiveis[index].PERGUNTA) {
      perguntas[idx].JA_FOI = 'S';
      break;
    }
  }

  // Movendo os dados do array de posição (index) 0 para a tela
  h3Pergunta.innerText = perguntasDisponiveis[index].PERGUNTA;
  labelResposta01.innerText = perguntasDisponiveis[index].RESP1;
  labelResposta02.innerText = perguntasDisponiveis[index].RESP2;
  labelResposta03.innerText = perguntasDisponiveis[index].RESP3;
  labelResposta04.innerText = perguntasDisponiveis[index].RESP4;    
}

function parar() {
  alert('Que pena, você desistiu!!!');
  window.location.href = "../../index.html"
}

function retornarRespostaSelecionada() {
  let resposta = document.querySelector('input[name="resposta"]:checked');
  return resposta;
}
