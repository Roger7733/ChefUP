const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

const PROMPT = `Você é um chef avaliador do aplicativo ChefUP, um jogo de culinária.
Analise a foto do prato enviada por um usuário aprendiz.

Avalie a apresentação, o cuidado no empratamento e o aspecto geral.
Seja encorajador e didático, como um professor gentil — o usuário está aprendendo.

Responda APENAS com um JSON válido, sem texto antes ou depois, neste formato exato:
{"nota": <número de 1 a 5>, "feedback": "<uma frase curta e construtiva em português>"}`;

export type ResultadoIA = {
  nota: number;
  feedback: string;
};

export async function avaliarPrato(base64: string): Promise<ResultadoIA> {
  const resposta = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
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