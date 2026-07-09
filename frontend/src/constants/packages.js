export const PACKAGES = [
  {
    id: 'Paquete 1',
    title: 'Paquete 1',
    items: [
      '2 HORAS DE SERVICIO',
      '4 a 6 guisos.',
      'Complementos 12 variedades.',
      'Plato, vaso y servilletas.',
      'Bebida.',
      'Personal de servicio.',
      'Coordinador de evento.',
    ],
  },
  {
    id: 'Paquete 2',
    title: 'Paquete 2',
    items: [
      '2 HORAS DE SERVICIO',
      'Pastor, Bisteck, Adobada, Lechón.',
      'Complementos 12 variedades.',
      'Plato, vaso y servilletas.',
      'Bebida.',
      'Personal de servicio.',
      'Coordinador de evento',
    ],
  },
  {
    id: 'Paquete 3',
    title: 'Paquete 3',
    items: [
      '2 HORAS DE SERVICIO',
      'Rib eye, Sirloin, Bisteck, Cecina, Chorizo español.',
      'Complementos 12 variedades.',
      'Plato, vaso y servilletas.',
      'Bebida.',
      'Personal de servicio.',
      'Coordinador de evento',
    ],
  },
  {
    id: 'Paquete 4',
    title: 'Paquete 4',
    items: [
      '2 HORAS DE SERVICIO',
      'Birria, Lechón, Barbacoa de borrego.',
      'Complementos 12 variedades.',
      'Plato, vaso y servilletas.',
      'Bebida.',
      'Personal de servicio.',
      'Coordinador de evento',
    ],
  },
];

export const EVENT_TYPES = ['Boda', 'XV años', 'Corporativo', 'Cumpleaños', 'Bautizo', 'Otro'];

export const BUSINESS = {
  name: 'MARE',
  address: 'AV DE LA CONVENCION PTE 1914 #1610, LA CONCORDIA. AGUASCALIENTES, AGS.',
  whatsapp: '4491737681',
  phone: '4499135323',
  email: 'mare.eventos.pro@gmail.com',
  facebook: 'https://www.facebook.com/share/1Am7qbogrR/',
  coords: [21.889722, -102.313],
};

export const CAROUSEL_IMAGES = [
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512058564366-c9e7ea963457?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604908177527-040378d450e4?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1621996359640-ecb4a5ca0fef?w=1200&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1481931715705-36a69e8d7f77?w=1200&q=80&auto=format&fit=crop',
];

export const DURATION_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const value = (i + 1) * 0.5;
  return { value, label: `${value} hora${value !== 1 ? 's' : ''}` };
});

export const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  const time = `${String(h).padStart(2, '0')}:${m}`;
  return { value: time, label: time };
});
