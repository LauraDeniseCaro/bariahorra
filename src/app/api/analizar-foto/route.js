import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'Falta OPENROUTER_API_KEY en .env.local' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const archivo = formData.get('foto');
    const tipo = formData.get('tipo') || 'gondola'; // 'gondola' o 'ticket'

    if (!archivo) {
      return NextResponse.json(
        { ok: false, error: 'No se envió ninguna foto' },
        { status: 400 }
      );
    }

    const arrayBuffer = await archivo.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = archivo.type || 'image/jpeg';

    // 1. Prompts especializados según el tipo de escaneo seleccionado por el vecino
    const promptGondola = `
Sos un digitalizador de carteles de precios y etiquetas de góndola de supermercados argentinos (La Anónima, Todo, ChangoMás, Carrefour, Diarco, etc.).
Analizá la foto de la etiqueta/cartel y extraé el producto y su precio de venta final al público.
NO agregues razonamiento, NO agregues explicaciones, NO uses etiquetas de pensamiento (<think>).
Tu respuesta debe comenzar directamente con el caracter { y terminar con }.

JSON obligatorio:
{
  "producto": "Nombre limpio del producto o corte (ej: Leche descremada, Bola de lomo, Aceite girasol)",
  "marca": "Marca si figura (ej: La Serenísima, Natura) o null",
  "cantidad": "Número (ej: 1, 500, 900) o null",
  "unidad_medida": "ml, l, gr, kg o u",
  "precio": 8490,
  "rubro": "Súper, Carnicería, Verdulería, Lácteos, Limpieza o Bebidas",
  "comercio": "La Anónima, Todo, ChangoMás, Carrefour, Diarco o null"
}
`;

    const promptTicket = `
Sos un digitalizador de tickets de supermercados argentinos (La Anónima, Todo, ChangoMás, Carrefour, Diarco, etc.).
Analizá la foto del ticket fiscal o recibo:
1. Identificá la cadena o supermercado emisor (desde el encabezado o logo: La Anónima, Todo, ChangoMás, etc.).
2. Identificá el ítem más representativo o principal del ticket junto con su importe cobrado.
NO agregues razonamiento, NO agregues explicaciones, NO uses etiquetas de pensamiento (<think>).
Tu respuesta debe comenzar directamente con el caracter { y terminar con }.

JSON obligatorio:
{
  "producto": "Nombre legible del producto principal del ticket (ej: Pan lactal, Yerba mate, Fideos)",
  "marca": null,
  "cantidad": "1",
  "unidad_medida": "u",
  "precio": 2350,
  "rubro": "Súper, Carnicería, Verdulería, Lácteos, Limpieza o Bebidas",
  "comercio": "La Anónima, Todo, ChangoMás, Carrefour, Diarco o null"
}
`;

    const promptFinal = tipo === 'ticket' ? promptTicket : promptGondola;

    // 2. Consultar modelos gratuitos con visión activos
    let modelosDisponibles = [];
    try {
      const resModels = await fetch('https://openrouter.ai/api/v1/models');
      if (resModels.ok) {
        const data = await resModels.json();
        modelosDisponibles = (data.data || [])
          .filter(m => {
            const esGratis = m.pricing?.prompt === '0' || m.id.endsWith(':free');
            const soportaVision = m.architecture?.modality?.includes('image') ||
                                  m.id.toLowerCase().includes('vision') ||
                                  m.id.toLowerCase().includes('vl');
            return esGratis && soportaVision;
          })
          .map(m => m.id);
      }
    } catch (e) {
      console.warn('Fallo lista dinámica:', e.message);
    }

    // Priorizamos Nvidia Nemotron que ya sabemos que responde bien en tu cuenta
    const listaCandidatos = [
      'nvidia/nemotron-3.5-super-vl:free',
      ...modelosDisponibles,
      'meta-llama/llama-3.2-11b-vision-instruct:free'
    ];

    const modelosAProbar = [...new Set(listaCandidatos)];

    let respuestaExitosa = null;
    let ultimoError = '';

    for (const modelId of modelosAProbar) {
      try {
        console.log(`📡 Consultando modelo: ${modelId} (${tipo})...`);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://bariahorra.vercel.app',
            'X-Title': 'BariAhorra'
          },
          body: JSON.stringify({
            model: modelId,
            max_tokens: 2500,
            temperature: 0.1,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: promptFinal },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${mimeType};base64,${base64Data}`
                    }
                  }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const contenido = data?.choices?.[0]?.message?.content;
          if (contenido) {
            console.log(`✅ Respuesta recibida con: ${modelId}`);
            respuestaExitosa = contenido;
            break;
          }
        } else {
          const errTexto = await response.text();
          console.warn(`⚠️ Error en ${modelId}:`, errTexto);
          ultimoError = errTexto;
        }
      } catch (e) {
        console.warn(`Fallo con ${modelId}:`, e.message);
        ultimoError = e.message;
      }
    }

    if (!respuestaExitosa) {
      return NextResponse.json(
        { ok: false, error: 'Los proveedores gratuitos están momentáneamente saturados. Podés cargar los datos a mano.' },
        { status: 502 }
      );
    }

    // 3. Limpieza de razonamiento y extracción estricta del JSON
    let textoLimpio = respuestaExitosa.trim();
    textoLimpio = textoLimpio.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    const primerLlave = textoLimpio.indexOf('{');
    const ultimaLlave = textoLimpio.lastIndexOf('}');

    if (primerLlave !== -1 && ultimaLlave !== -1 && ultimaLlave > primerLlave) {
      textoLimpio = textoLimpio.substring(primerLlave, ultimaLlave + 1);
    }

    const resultado = JSON.parse(textoLimpio);
    return NextResponse.json({ ok: true, datos: resultado });
  } catch (error) {
    console.error('❌ Error analizando foto con IA:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al procesar los datos de la imagen' },
      { status: 500 }
    );
  }
}