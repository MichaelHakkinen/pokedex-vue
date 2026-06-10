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

// Each region: label shown in UI, offset into the National Dex, and count
export const REGIONS = [
  { id: 'national',  label: '🌐 National',    offset: 0,    count: 1025 },
  { id: 'kanto',     label: '🔴 Kanto',        offset: 0,    count: 151  },
  { id: 'johto',     label: '🌿 Johto',        offset: 151,  count: 100  },
  { id: 'hoenn',     label: '🌊 Hoenn',        offset: 251,  count: 135  },
  { id: 'sinnoh',    label: '❄️ Sinnoh',       offset: 386,  count: 107  },
  { id: 'unova',     label: '🗽 Unova',        offset: 493,  count: 156  },
  { id: 'kalos',     label: '🗼 Kalos',        offset: 649,  count: 72   },
  { id: 'alola',     label: '🌺 Alola',        offset: 721,  count: 88   },
  { id: 'galar',     label: '⚔️ Galar',        offset: 809,  count: 96   },
  { id: 'hisui',     label: '🏔️ Hisui',       offset: 905,  count: 7    },
  { id: 'paldea',    label: '🌹 Paldea',       offset: 905,  count: 120  },
]

export const ALL_TYPES = [
  'all','fire','water','grass','electric','poison','bug','normal','ground',
  'fairy','fighting','psychic','rock','ghost','ice','dragon','dark','steel','flying',
]
