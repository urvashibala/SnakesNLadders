export const boardCatalog = [
  {
    id: 'sakya_pandita_1',
    group: 'Rebirth Game - Sakya Pandita (1)',
    title: 'Version 1',
    imageUrl: '/boards/sakya_pandita1.jpg',
    playable: true
  },
  {
    id: 'sakya_pandita_2',
    group: 'Rebirth Game - Sakya Pandita (1)',
    title: 'Version 2',
    imageUrl: '/boards/sakya_pandita2.jpg',
    playable: false
  },
  {
    id: 'sakya_pandita_3',
    group: 'Rebirth Game - Sakya Pandita (1)',
    title: 'Version 3',
    imageUrl: '/boards/sakya_pandita3.jpg',
    playable: false
  },
  {
    id: 'moksha_patam_1',
    group: 'Moksha Patam (By Saint Dnyaneshwar/Gwandev) (2)',
    title: 'Board',
    imageUrl: '',
    playable: false
  },
  {
    id: 'gyan_chaupar_board_1',
    group: 'Gyan Chaupar Board',
    title: 'National Museum India',
    imageUrl: '/boards/Gyan_Chaupar_National_Museum_India.JPG',
    playable: false
  },
  {
    id: 'gyan_chaupar_board_2',
    group: 'Gyan Chaupar Board',
    title: 'Version 2',
    imageUrl: '/boards/gyan_chaupar1.png',
    playable: false
  },
  {
    id: 'gyan_chaupar_annotated',
    group: 'Gyan Chaupar Board',
    title: 'National Museum India (Annotated - Testing)',
    imageUrl: '/boards/Gyan_Chaupar_National_Museum_India.JPG',
    playable: true
  },
  {
    id: 'jain_board_1',
    group: 'Jnana/Gyan Bazi -- Hindi Jain Boards -- 19th century, on cloth, gouache',
    title: 'Version 1',
    imageUrl: '/boards/hindi_jain_board.jpg',
    playable: false
  },
  {
    id: 'jain_board_2',
    group: 'Jnana/Gyan Bazi -- Hindi Jain Boards -- 19th century, on cloth, gouache',
    title: 'Version 2',
    imageUrl: '/boards/Jain Snakes and Ladders (Bnana Bazi).jpg',
    playable: false
  },
  {
    id: 'jain_board_3',
    group: 'Jnana/Gyan Bazi -- Hindi Jain Boards -- 19th century, on cloth, gouache',
    title: 'Lokapurush Motif',
    imageUrl: '/boards/jain_gyan_chaupar_with_motif.jpg',
    playable: false
  },
  {
    id: 'royal_asiatic_society_1832',
    group: 'Royal Board Asiatic Society - 1832',
    title: 'Board',
    imageUrl: '/boards/royal_asiatic_society.jpg',
    playable: false
  },
  {
    id: 'jnana_chaupada_1834',
    group: 'Jnana Chaupada - 1834',
    title: 'Board',
    imageUrl: '/boards/jnana_chaupada.jpg',
    playable: false
  },
  {
    id: 'leela_game_of_self_knowledge',
    group: 'Leela Game of Self Knowledge - 2000-5000 years ago',
    title: 'Main Board',
    imageUrl: '/boards/Leela_game_of_self_discovery.jpg',
    playable: false
  },
  {
    id: 'leela_game_translation',
    group: 'Leela Game of Self Knowledge - 2000-5000 years ago',
    title: 'Translation',
    imageUrl: '/boards/Leela_game_translation.jpeg',
    playable: false
  },
  {
    id: 'miltons_checkered_game_of_life',
    group: "Milton's Checkered Game of Life - 1860",
    title: 'Board',
    imageUrl: '/boards/Milton Checkered Game of Life.jpg',
    playable: false
  },
  {
    id: 'parama_padam_sopanam_pata_1',
    group: 'Tamil -- Parama Padam Sopanam Pata - 19th century, undated',
    title: 'Original Lithograph',
    imageUrl: '/boards/Parampada Sopanam Pata.jpg',
    playable: false
  },
  {
    id: 'parama_padam_sopanam_pata_2',
    group: 'Tamil -- Parama Padam Sopanam Pata - 19th century, undated',
    title: 'Modern Print',
    imageUrl: '/boards/PARAMA_PATHAM.jpg',
    playable: false
  },
  {
    id: 'sufi_version_1915',
    group: 'Sufi Version - 1915',
    title: 'Board',
    imageUrl: '/boards/Sufi Version.png',
    playable: false
  },
  {
    id: 'fh_ayers_circular_1892',
    group: 'FH Ayers Circular - 1892',
    title: 'Board',
    imageUrl: '/boards/FHAyersCircular.jpg',
    playable: false
  },
  {
    id: 'kismet_1895',
    group: 'Kismet - 1895',
    title: 'Board',
    imageUrl: '/boards/Kismet.jpg',
    playable: false
  }
];

export function getBoardById(id) {
  return boardCatalog.find((board) => board.id === id) ?? null;
}

export function getBoardGroups() {
  const groups = new Map();

  for (const board of boardCatalog) {
    if (!groups.has(board.group)) {
      groups.set(board.group, []);
    }
    groups.get(board.group).push(board);
  }

  return Array.from(groups.entries()).map(([group, boards]) => ({ group, boards }));
}