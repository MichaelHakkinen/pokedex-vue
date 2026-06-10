export const POKEMON_TYPE_COLORS = {
  fire:     '#F08030',
  water:    '#6890F0',
  grass:    '#78C850',
  electric: '#F8D030',
  poison:   '#A040A0',
  bug:      '#A8B820',
  normal:   '#A8A878',
  ground:   '#E0C068',
  fairy:    '#EE99AC',
  fighting: '#C03028',
  psychic:  '#F85888',
  rock:     '#B8A038',
  ghost:    '#705898',
  ice:      '#98D8D8',
  dragon:   '#7038F8',
  dark:     '#705848',
  steel:    '#B8B8D0',
  flying:   '#A890F0',
  shadow:   '#604E82',
}

export const DEFAULT_COLOR = '#777'

// Pokémon count per generation (National Pokédex IDs, 1-indexed)
// Source: official game Pokédex counts
export const REGIONS = [
  { id: 'national', label: 'National',  emoji: '🌐', gen: 'All Generations', offset: 0,    count: 1025, color: '#ef5350', games: 'All Games' },
  { id: 'kanto',    label: 'Kanto',     emoji: '🔴', gen: 'Generation I',    offset: 0,    count: 151,  color: '#ef5350', games: 'Red / Blue / Yellow' },
  { id: 'johto',    label: 'Johto',     emoji: '🌿', gen: 'Generation II',   offset: 151,  count: 100,  color: '#4CAF50', games: 'Gold / Silver / Crystal' },
  { id: 'hoenn',    label: 'Hoenn',     emoji: '🌊', gen: 'Generation III',  offset: 251,  count: 135,  color: '#2196F3', games: 'Ruby / Sapphire / Emerald' },
  { id: 'sinnoh',   label: 'Sinnoh',    emoji: '❄️', gen: 'Generation IV',   offset: 386,  count: 107,  color: '#9C27B0', games: 'Diamond / Pearl / Platinum' },
  { id: 'unova',    label: 'Unova',     emoji: '🗽', gen: 'Generation V',    offset: 493,  count: 156,  color: '#FF9800', games: 'Black / White' },
  { id: 'kalos',    label: 'Kalos',     emoji: '🗼', gen: 'Generation VI',   offset: 649,  count: 72,   color: '#00BCD4', games: 'X / Y' },
  { id: 'alola',    label: 'Alola',     emoji: '🌺', gen: 'Generation VII',  offset: 721,  count: 88,   color: '#FF5722', games: 'Sun / Moon' },
  { id: 'galar',    label: 'Galar',     emoji: '⚔️', gen: 'Generation VIII', offset: 809,  count: 89,   color: '#607D8B', games: 'Sword / Shield' },
  { id: 'hisui',    label: 'Hisui',     emoji: '🏔️', gen: 'Generation VIII', offset: 898,  count: 7,    color: '#795548', games: 'Legends: Arceus' },
  { id: 'paldea',   label: 'Paldea',    emoji: '🌹', gen: 'Generation IX',   offset: 905,  count: 120,  color: '#E91E63', games: 'Scarlet / Violet' },
]

export const ALL_TYPES = [
  'all','fire','water','grass','electric','poison','bug','normal','ground',
  'fairy','fighting','psychic','rock','ghost','ice','dragon','dark','steel','flying',
]
