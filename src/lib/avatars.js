// src/lib/avatars.js
const BASE_DICEBEAR = 'https://api.dicebear.com/7.x/bottts/svg';

export const AVATARES = [
  { id: 'avatar-1', label: 'Robot 1', src: `${BASE_DICEBEAR}?seed=Bari1` },
  { id: 'avatar-2', label: 'Robot 2', src: `${BASE_DICEBEAR}?seed=Bari2` },
  { id: 'avatar-3', label: 'Robot 3', src: `${BASE_DICEBEAR}?seed=Bari3` },
  { id: 'avatar-4', label: 'Robot 4', src: `${BASE_DICEBEAR}?seed=Bari4` },
  { id: 'avatar-5', label: 'Robot 5', src: `${BASE_DICEBEAR}?seed=Bari5` },
  { id: 'avatar-6', label: 'Robot 6', src: `${BASE_DICEBEAR}?seed=Bari6` },
  { id: 'avatar-7', label: 'Robot 7', src: `${BASE_DICEBEAR}?seed=Bari7` },
  { id: 'avatar-8', label: 'Robot 8', src: `${BASE_DICEBEAR}?seed=Bari8` },
  { id: 'avatar-9', label: 'Robot 9', src: `${BASE_DICEBEAR}?seed=Bari9` },
  { id: 'avatar-10', label: 'Robot 10', src: `${BASE_DICEBEAR}?seed=Bari10` },
];

export const obtenerAvatar = (id) => {
  return AVATARES.find((a) => a.id === id) || AVATARES[0];
};