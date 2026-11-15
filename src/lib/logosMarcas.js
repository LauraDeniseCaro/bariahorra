// Logos oficiales HD en Wikimedia Commons
const LOGOS_OFICIALES_HD = {
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
  'lays': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Lay%27s_logo_2019.svg/320px-Lay%27s_logo_2019.svg.png',
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

  if (LOGOS_OFICIALES_HD[norm]) return LOGOS_OFICIALES_HD[norm];

  for (const [clave, url] of Object.entries(LOGOS_OFICIALES_HD)) {
    if (norm.includes(clave) || clave.includes(norm)) return url;
  }

  return null;
}