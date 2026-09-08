const CLOUD_NAME = 'am7rpivd';
const UPLOAD_PRESET = 'chefup_pratos';

export async function uploadFoto(uriLocal: string): Promise<string> {
  const formData = new FormData();

  formData.append('file', {
    uri: uriLocal,
    type: 'image/jpeg',
    name: 'prato.jpg',
  } as any);

  formData.append('upload_preset', UPLOAD_PRESET);

  const resposta = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.error?.message || 'Falha no upload da imagem');
  }

  return dados.secure_url;
}