// Logos oficiales HD en Wikimedia Commons
const LOGOS_WIKIMEDIA = {
  'coca cola': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/320px-Coca-Cola_logo.svg.png',
  'sprite': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Sprite_Logo.svg/320px-Sprite_Logo.svg.png',
  'fanta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Fanta_logo_%282009%29.svg/320px-Fanta_logo_%282009%29.svg.png',
  'pepsi': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pepsi_logo_2014.svg/320px-Pepsi_logo_2014.svg.png',
  'gatorade': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Gatorade_logo.svg/320px-Gatorade_logo.svg.png',
  'quilmes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Quilmes_Logo_Nuevo.png/320px-Quilmes_Logo_Nuevo.png',
  'brahma': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Brahma_logo.svg/320px-Brahma_logo.svg.png',
  'stella artois': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Stella_Artois_logo.svg/320px-Stella_Artois_logo.svg.png',
  'corona': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Corona_Extra_logo.svg/320px-Corona_Extra_logo.svg.png',
  'heineken': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Heineken_logo.svg/320px-Heineken_logo.svg.png',
  'arcor': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Arcor_logo.svg/320px-Arcor_logo.svg.png',
  'oreo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Oreo-Logo.png/320px-Oreo-Logo.png',
  'nescafe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Nescaf%C3%A9_logo.svg/320px-Nescaf%C3%A9_logo.svg.png',
  'nesquik': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Nesquik_logo.svg/320px-Nesquik_logo.svg.png',
  'knorr': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Knorr_logo.svg/320px-Knorr_logo.svg.png',
  'hellmanns': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Hellmann%27s_logo.svg/320px-Hellmann%27s_logo.svg.png',
  'colgate': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Colgate_logo.svg/320px-Colgate_logo.svg.png',
  'oral b': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Oral-B_logo.svg/320px-Oral-B_logo.svg.png',
  'dove': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Dove_logo.svg/320px-Dove_logo.svg.png',
  'rexona': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Rexona_logo.svg/320px-Rexona_logo.svg.png',
  'pantene': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Pantene_logo.svg/320px-Pantene_logo.svg.png',
  'gillette': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Gillette_logo.svg/320px-Gillette_logo.svg.png',
  'nivea': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Nivea_logo.svg/320px-Nivea_logo.svg.png',
  'huggies': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Huggies_logo.svg/320px-Huggies_logo.svg.png',
  'pampers': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Pampers_logo.svg/320px-Pampers_logo.svg.png',
  'ariel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Ariel_logo.svg/320px-Ariel_logo.svg.png',
  'pedigree': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Pedigree_logo.svg/320px-Pedigree_logo.svg.png',
  'whiskas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Whiskas_logo.svg/320px-Whiskas_logo.svg.png'
};

// Emblemas vectoriales SVG nítidos (cero pixelado) para marcas nacionales
const EMBLEMAS_NACIONALES = {
  'la serenisima': { linea1: 'LA', linea2: 'SERENÍSIMA', bg: '#0ea5e9', fg: '#ffffff' },
  'ilolay': { linea1: 'ILOLAY', linea2: 'LÁCTEOS', bg: '#1d4ed8', fg: '#ffffff' },
  'tregar': { linea1: 'TREGAR', linea2: 'SANTA FE', bg: '#dc2626', fg: '#ffffff' },
  'sancor': { linea1: 'SANCOR', linea2: 'LÁCTEOS', bg: '#0284c7', fg: '#ffffff' },
  'milkaut': { linea1: 'MILKAUT', linea2: '', bg: '#1e3a8a', fg: '#ffffff' },
  'tonadita': { linea1: 'TONADITA', linea2: '', bg: '#1d4ed8', fg: '#fde047' },
  'casancrem': { linea1: 'CASANCREM', linea2: '', bg: '#dc2626', fg: '#ffffff' },
  'yogurisimo': { linea1: 'YOGURÍSIMO', linea2: '', bg: '#0284c7', fg: '#ffffff' },
  'cindor': { linea1: 'CINDOR', linea2: '', bg: '#78350f', fg: '#fde047' },
  'marolio': { linea1: 'MAROLIO', linea2: '', bg: '#dc2626', fg: '#fef08a' },
  'molto': { linea1: 'MOLTO', linea2: '', bg: '#b91c1c', fg: '#ffffff' },
  'lucchetti': { linea1: 'LUCCHETTI', linea2: '', bg: '#dc2626', fg: '#ffffff' },
  'matarazzo': { linea1: 'MATARAZZO', linea2: '', bg: '#b91c1c', fg: '#fef08a' },
  'gallo': { linea1: 'GALLO', linea2: '', bg: '#dc2626', fg: '#ffffff' },
  'cocinero': { linea1: 'COCINERO', linea2: '', bg: '#15803d', fg: '#fde047' },
  'natura': { linea1: 'NATURA', linea2: '', bg: '#16a34a', fg: '#fef08a' },
  'canuelas': { linea1: 'CAÑUELAS', linea2: '', bg: '#1e40af', fg: '#ffffff' },
  'pureza': { linea1: 'PUREZA', linea2: '', bg: '#2563eb', fg: '#ffffff' },
  '9 de oro': { linea1: '9 DE ORO', linea2: '', bg: '#d97706', fg: '#ffffff' },
  'playadito': { linea1: 'PLAYADITO', linea2: 'YERBA MATE', bg: '#eab308', fg: '#b91c1c' },
  'taragui': { linea1: 'TARAGÜÍ', linea2: 'YERBA MATE', bg: '#dc2626', fg: '#ffffff' },
  'mananita': { linea1: 'MAÑANITA', linea2: 'YERBA MATE', bg: '#16a34a', fg: '#fef08a' },
  'la merced': { linea1: 'LA MERCED', linea2: 'YERBA MATE', bg: '#14532d', fg: '#fde047' },
  'amanda': { linea1: 'AMANDA', linea2: 'YERBA MATE', bg: '#dc2626', fg: '#ffffff' },
  'rosamonte': { linea1: 'ROSAMONTE', linea2: 'YERBA MATE', bg: '#b91c1c', fg: '#ffffff' },
  'cruz de malta': { linea1: 'CRUZ DE', linea2: 'MALTA', bg: '#991b1b', fg: '#ffffff' },
  'cbse': { linea1: 'CBSé', linea2: 'YERBA MATE', bg: '#16a34a', fg: '#ffffff' },
  'baggio': { linea1: 'BAGGIO', linea2: '', bg: '#ea580c', fg: '#fef08a' },
  'villavicencio': { linea1: 'VILLA', linea2: 'VICENCIO', bg: '#0284c7', fg: '#ffffff' },
  'andes origen': { linea1: 'ANDES', linea2: 'ORIGEN', bg: '#92400e', fg: '#fef3c7' },
  'patagonia': { linea1: 'PATAGONIA', linea2: 'CERVEZA', bg: '#14532d', fg: '#fef3c7' },
  'schneider': { linea1: 'SCHNEIDER', linea2: '', bg: '#dc2626', fg: '#ffffff' },
  'sedal': { linea1: 'SEDAL', linea2: '', bg: '#db2777', fg: '#ffffff' },
  'plusbelle': { linea1: 'PLUSBELLE', linea2: '', bg: '#7c3aed', fg: '#ffffff' },
  'skip': { linea1: 'SKIP', linea2: '', bg: '#1e3a8a', fg: '#ffffff' },
  'ala': { linea1: 'ALA', linea2: '', bg: '#0284c7', fg: '#ffffff' },
  'vivere': { linea1: 'VÍVERE', linea2: '', bg: '#7e22ce', fg: '#ffffff' },
  'querubin': { linea1: 'QUERUBÍN', linea2: '', bg: '#db2777', fg: '#ffffff' },
  'zorro': { linea1: 'ZORRO', linea2: '', bg: '#1d4ed8', fg: '#ffffff' },
  'cif': { linea1: 'CIF', linea2: '', bg: '#0f766e', fg: '#ffffff' },
  'magistral': { linea1: 'MAGISTRAL', linea2: '', bg: '#eab308', fg: '#1e293b' },
  'ayudin': { linea1: 'AYUDÍN', linea2: '', bg: '#facc15', fg: '#1e3a8a' },
  'odex': { linea1: 'ODEX', linea2: '', bg: '#16a34a', fg: '#ffffff' },
  'poett': { linea1: 'POETT', linea2: '', bg: '#9333ea', fg: '#ffffff' },
  'higienol': { linea1: 'HIGIENOL', linea2: '', bg: '#1e40af', fg: '#ffffff' },
  'elite': { linea1: 'ELITE', linea2: '', bg: '#1d4ed8', fg: '#ffffff' },
  'sussex': { linea1: 'SUSSEX', linea2: '', bg: '#dc2626', fg: '#ffffff' },
  'paty': { linea1: 'PATY', linea2: '', bg: '#dc2626', fg: '#ffffff' },
  'swift': { linea1: 'SWIFT', linea2: '', bg: '#b91c1c', fg: '#fef08a' },
  'paladini': { linea1: 'PALADINI', linea2: '', bg: '#dc2626', fg: '#ffffff' },
  'sadia': { linea1: 'SADIA', linea2: '', bg: '#dc2626', fg: '#fde047' },
  'granja del sol': { linea1: 'GRANJA', linea2: 'DEL SOL', bg: '#15803d', fg: '#fde047' },
  'mccain': { linea1: 'McCAIN', linea2: '', bg: '#18181b', fg: '#facc15' },
  'la saltena': { linea1: 'LA SALTEÑA', linea2: '', bg: '#b91c1c', fg: '#fef08a' }
};

function generarSvgMarca({ linea1, linea2, bg, fg }) {
  const texto2 = linea2
    ? `<text x="64" y="84" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="${fg}" opacity="0.88" text-anchor="middle" letter-spacing="0.5">${linea2}</text>`
    : '';
  const y1 = linea2 ? '60' : '70';
  const size1 = linea1.length > 9 ? '15' : linea1.length > 6 ? '18' : '22';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="16" fill="${bg}"/>
    <rect x="6" y="6" width="116" height="116" rx="12" fill="none" stroke="${fg}" stroke-opacity="0.25" stroke-width="2"/>
    <text x="64" y="${y1}" font-family="system-ui, -apple-system, sans-serif" font-size="${size1}" font-weight="900" fill="${fg}" text-anchor="middle">${linea1}</text>
    ${texto2}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function obtenerLogoMarca(marcaRaw = '') {
  if (!marcaRaw) return null;
  const norm = String(marcaRaw)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’.-]/g, '')
    .trim();

  if (!norm || ['generica', 'la anonima', 'carrefour', 'okey', 'best', 's/m'].includes(norm)) {
    return null;
  }

  // 1. Logo PNG oficial en Wikimedia Commons
  if (LOGOS_WIKIMEDIA[norm]) return LOGOS_WIKIMEDIA[norm];
  for (const [clave, url] of Object.entries(LOGOS_WIKIMEDIA)) {
    if (norm.includes(clave) || clave.includes(norm)) return url;
  }

  // 2. Emblema vectorial SVG nítido para marcas nacionales
  if (EMBLEMAS_NACIONALES[norm]) return generarSvgMarca(EMBLEMAS_NACIONALES[norm]);
  for (const [clave, conf] of Object.entries(EMBLEMAS_NACIONALES)) {
    if (norm.includes(clave) || clave.includes(norm)) return generarSvgMarca(conf);
  }

  return null;
}