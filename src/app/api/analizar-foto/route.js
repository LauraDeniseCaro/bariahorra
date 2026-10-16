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

    if (!archivo) {
      return NextResponse.json(
        { ok: false, error: 'No se envió ninguna foto' },
        { status: 400 }
      );
    }

    const arrayBuffer = await archivo.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = archivo.type || 'image/jpeg';

    const prompt = `
Sos un digitalizador de carteles de precios de supermercados argentinos.
Analizá la foto y extraé producto y precio.
NO agregues razonamiento, NO agregues explicaciones, NO uses etiquetas de pensamiento.
Tu respuesta debe comenzar directamente con el caracter { y terminar con }.

JSON obligatorio:
{
  "producto": "Nombre legible del producto o corte de carne",
  "marca": null,
  "cantidad": "1",
  "unidad_medida": "kg",
  "precio": 8490,
  "rubro": "Carnicería",
  "comercio": "La Anónima"
}
`;

    // Consultar modelos gratuitos con visión activos
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

    // Ponemos primero el modelo de Nvidia que ya confirmó que funciona en tu cuenta
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
        console.log(`📡 Consultando modelo: ${modelId}...`);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'BariAhorra'
          },
          body: JSON.stringify({
            model: modelId,
            max_tokens: 2500, // Espacio suficiente para completar el JSON sin truncarse
            temperature: 0.1,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
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
            console.log('📄 Texto crudo devuelto:\n', contenido);
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
        { ok: false, error: 'Los proveedores gratuitos están saturados. Reintentá en unos segundos.' },
        { status: 502 }
      );
    }

    // Extracción limpia entre la primera llave { y la última }
    let textoLimpio = respuestaExitosa.trim();
    
    // Si contiene etiquetas <think>...</think>, las removemos
    textoLimpio = textoLimpio.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    const primerLlave = textoLimpio.indexOf('{');
    const ultimaLlave = textoLimpio.lastIndexOf('}');

    if (primerLlave !== -1 && ultimaLlave !== -1 && ultimaLlave > primerLlave) {
      textoLimpio = textoLimpio.substring(primerLlave, ultimaLlave + 1);
    }

    const resultado = JSON.parse(textoLimpio);
    return NextResponse.json({ ok: true, datos: resultado });
  } catch (error) {
    console.error('❌ Error parseando JSON de la foto:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Error al procesar los datos de la imagen' },
      { status: 500 }
    );
  }
}