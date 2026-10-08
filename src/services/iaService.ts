const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

function montarPrompt(pratoEsperado: string, ingredientesEsperados: string[]): string {
  const temIngredientes = ingredientesEsperados.length > 0;
  const listaIngredientes = ingredientesEsperados.join(', ');

  return `Você é um chef avaliador do aplicativo ChefUP, um jogo de culinária.
O usuário deveria ter preparado o seguinte prato: "${pratoEsperado}".
${
  temIngredientes
    ? `\nEste prato é definido por estes ingredientes/elementos: ${listaIngredientes}.
Um prato BEM executado mostra sinais visíveis desses ingredientes (ex: alho dourado, brilho do azeite, cor do molho, ervas e temperos por cima).`
    : ''
}

Analise a foto enviada seguindo estes passos, NESTA ordem:

1. CORRESPONDÊNCIA: Verifique se a imagem é realmente o prato "${pratoEsperado}" (ou ao menos a mesma categoria de alimento).
   - Se NÃO for (for outro alimento, ou não for comida): atribua nota 1, deixe TODOS os criterios com pontos 0,
     e no feedback explique gentilmente que a foto não corresponde ao prato solicitado. PARE por aqui.

2. COMPLETUDE (seja RIGOROSO): Verifique se o prato está COMPLETO, ou seja, se os ingredientes/elementos que o definem aparecem na foto.
   - Se o prato estiver claramente INCOMPLETO — por exemplo, apenas o ingrediente base (como massa cozida pura, sem molho, sem alho, sem azeite e sem nenhum tempero visível) quando a receita pede esses elementos — a nota NÃO pode passar de 2.
   - Nesse caso, no feedback e na dica diga de forma clara e gentil O QUE ESTÁ FALTANDO (ex: "faltou o alho dourado e a salsinha").
   - NÃO dê notas altas (4 ou 5) só porque o alimento é da categoria certa. Notas altas exigem um prato COMPLETO e bem executado.

3. AVALIAÇÃO: Se o prato corresponde e está razoavelmente completo, avalie de forma encorajadora e didática, como um professor gentil.
   Dê uma nota de 1 a 5 estrelas para o conjunto e avalie 5 critérios, cada um com pontuação de 0 a 100 e um comentário curto e específico:
   - "Completude" (os ingredientes principais aparecem? o prato está inteiro?)
   - "Apresentação" (empratamento, organização no prato)
   - "Cor" (coloração, douramento, aparência apetitosa)
   - "Técnica" (execução, cozimento, cortes)
   - "Proporção" (equilíbrio das quantidades)
   No campo "dica", dê UMA sugestão prática e específica para a próxima vez.

Responda APENAS com um JSON válido, sem texto antes ou depois, neste formato exato:
{
  "nota": <número de 1 a 5>,
  "feedback": "<uma frase curta e encorajadora em português>",
  "dica": "<uma sugestão prática para melhorar>",
  "criterios": [
    {"nome": "Completude", "pontos": <0 a 100>, "comentario": "<comentário curto>"},
    {"nome": "Apresentação", "pontos": <0 a 100>, "comentario": "<comentário curto>"},
    {"nome": "Cor", "pontos": <0 a 100>, "comentario": "<comentário curto>"},
    {"nome": "Técnica", "pontos": <0 a 100>, "comentario": "<comentário curto>"},
    {"nome": "Proporção", "pontos": <0 a 100>, "comentario": "<comentário curto>"}
  ]
}`;
}

export type Criterio = {
  nome: string;
  pontos: number;
  comentario: string;
};

export type ResultadoIA = {
  nota: number;
  feedback: string;
  dica: string;
  criterios: Criterio[];
};

// espera um número de milissegundos
function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function avaliarPrato(
  base64: string,
  pratoEsperado: string,
  ingredientesEsperados: string[] = []
): Promise<ResultadoIA> {
  const MAX_TENTATIVAS = 3;

  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    const resposta = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: montarPrompt(pratoEsperado, ingredientesEsperados) },
              { inline_data: { mime_type: 'image/jpeg', data: base64 } },
            ],
          },
        ],
      }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      const textoResposta = dados?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textoResposta) {
        throw new Error('A IA não retornou uma resposta. Tente novamente.');
      }

      const textoLimpo = textoResposta.replace(/```json|```/g, '').trim();

      try {
        return JSON.parse(textoLimpo) as ResultadoIA;
      } catch {
        throw new Error('Não consegui interpretar a avaliação. Tente enviar a foto novamente.');
      }
    }

    const mensagem = dados.error?.message || '';
    const sobrecarga =
      resposta.status === 503 ||
      resposta.status === 429 ||
      mensagem.toLowerCase().includes('demand') ||
      mensagem.toLowerCase().includes('overloaded');

    // se for sobrecarga e ainda há tentativas, espera e tenta de novo
    if (sobrecarga && tentativa < MAX_TENTATIVAS) {
      await esperar(2000 * tentativa); // espera 2s, depois 4s...
      continue;
    }

    // erro que não é sobrecarga, ou acabaram as tentativas
    throw new Error(mensagem || 'Falha ao avaliar o prato');
  }

  throw new Error('O serviço está sobrecarregado. Tente novamente em alguns instantes.');
}