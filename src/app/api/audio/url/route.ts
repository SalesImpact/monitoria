import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Configurar cliente S3 para DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY!,
  },
  forcePathStyle: false, // DigitalOcean Spaces usa virtual-hosted-style
});

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const storedAudioUrl = searchParams.get('storedAudioUrl');

    if (!filename && !storedAudioUrl) {
      return NextResponse.json(
        { error: 'filename ou storedAudioUrl é obrigatório' },
        { status: 400 }
      );
    }

    // Determinar a chave do objeto no Spaces
    let key: string;
    
    if (storedAudioUrl) {
      // Se já temos uma URL completa, extrair o caminho
      // Exemplo: "meetime-recordings/12345/audio.mp3" ou URL completa
      if (storedAudioUrl.startsWith('http')) {
        // Extrair o caminho da URL
        try {
          const urlObj = new URL(storedAudioUrl);
          key = urlObj.pathname.replace(/^\//, ''); // Remove barra inicial
        } catch {
          // Se não for uma URL válida, tratar como caminho relativo
          key = storedAudioUrl;
        }
      } else {
        // Já é um caminho relativo
        key = storedAudioUrl;
      }
    } else {
      // Usar filename com o folder prefix
      const folder = process.env.DO_SPACES_AUDIO_FOLDER || 'meetime-recordings/';
      key = `${folder}${filename}`;
    }

    // Garantir que a chave não comece com /
    key = key.replace(/^\//, '');

    // Gerar URL assinada válida por 1 hora
    const command = new GetObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hora
    });

    return NextResponse.json({ url: signedUrl });
  } catch (error: any) {
    console.error('Erro ao gerar URL assinada:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar URL do áudio', details: error.message },
      { status: 500 }
    );
  }
}

