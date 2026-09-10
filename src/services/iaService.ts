const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

function montarPrompt(pratoEsperado: string): string {
  return `Você é um chef avaliador do aplicativo ChefUP, um jogo de culinária.
O usuário deveria ter preparado o seguinte prato: "${pratoEsperado}".

Analise a foto enviada seguindo estes passos:
1. Verifique se a imagem realmente corresponde ao prato "${pratoEsperado}".
2. Se a imagem NÃO corresponder ao prato esperado (for outro alimento, ou não for comida),
   atribua nota 1 e no feedback explique gentilmente que a foto não corresponde ao prato solicitado.
3. Se corresponder, avalie a apresentação, o empratamento e o aspecto geral,
   sendo encorajador e didático, como um professor gentil com um aluno.

Responda APENAS com um JSON válido, sem texto antes ou depois, neste formato exato:
{"nota": <número de 1 a 5>, "feedback": "<uma frase curta e construtiva em português>"}`;
}

export type ResultadoIA = {
  nota: number;
  feedback: string;
};

export async function avaliarPrato(base64: string, pratoEsperado: string): Promise<ResultadoIA> {
  const resposta = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: montarPrompt(pratoEsperado) },
            { inline_data: { mime_type: 'image/jpeg', data: base64 } },
          ],
        },
      ],
    }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.error?.message || 'Falha ao avaliar o prato');
  }

  const textoResposta = dados.candidates[0].content.parts[0].text;
  const textoLimpo = textoResposta.replace(/```json|```/g, '').trim();
  return JSON.parse(textoLimpo) as ResultadoIA;
}