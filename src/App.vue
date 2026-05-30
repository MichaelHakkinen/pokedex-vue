<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import Header from '@/components/Header.vue'
import PokemonCard from '@/components/PokemonCard.vue'
import { POKEMON_TYPE_COLORS, DEFAULT_COLOR } from './constants'

const mainRef = ref(null)
const pokemons = ref([])
const loading = ref(true)
const error = ref(null)
const selectedPokemon = ref(null)
const offset = ref(0)
const limit = ref(20)
const searchQuery = ref('')

const calculateLimit = () => {
  if (!mainRef.value) return
  
  const containerWidth = mainRef.value.clientWidth
  // Measure available height more accurately (Viewport - Header - Controls - Footer)
  const availableHeight = window.innerHeight - 200 
  
  // Refined Card dimensions (Width: 180min + 20gap = 200, Height: ~220 + 20gap = 240)
  const cardWidth = 200 
  const cardHeight = 240
  
  const cols = Math.max(1, Math.floor(containerWidth / cardWidth))
  // Use ceil to ensure we at least fill the screen
  const rows = Math.max(1, Math.ceil(availableHeight / cardHeight))
  
  // Ensure the limit is always a multiple of columns for a clean "full row" look
  const newLimit = cols * rows
  
  // If limit changed, adjust offset to stay on roughly the same "page"
  if (limit.value !== newLimit && pokemons.value.length > 0) {
    const currentIndex = offset.value
    limit.value = newLimit
    offset.value = Math.floor(currentIndex / newLimit) * newLimit
    fetchPokemons()
  } else {
    limit.value = newLimit
  }
}

let resizeTimer = null
const handleResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    calculateLimit()
  }, 300)
}

const fetchPokemons = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit.value}&offset=${offset.value}`
    )
    
    if (!response.ok) throw new Error('Failed to fetch Pokemon list')
    
    const data = await response.json()

    const results = await Promise.all(
      data.results.map(async (pokemon) => {
        const res = await fetch(pokemon.url)
        if (!res.ok) return null
        const details = await res.json()

        return {
          id: details.id,
          name: details.name,
          image: details.sprites.front_default || details.sprites.other['official-artwork'].front_default,
          types: details.types.map(t => t.type.name),
          stats: details.stats.map(s => ({ name: s.stat.name, value: s.base_stat }))
        }
      })
    )

    pokemons.value = results.filter(p => p !== null)
  } catch (err) {
    error.value = err.message
    console.error('Error fetching pokemons:', err)
  } finally {
    loading.value = false
  }
}

const filteredPokemons = computed(() => {
  if (!searchQuery.value) return pokemons.value
  return pokemons.value.filter(pokemon => 
    pokemon.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(async () => {
  await nextTick()
  calculateLimit()
  await fetchPokemons()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  clearTimeout(resizeTimer)
})

const nextPage = () => {
  offset.value += limit.value
  fetchPokemons()
}

const prevPage = () => {
  if (offset.value === 0) return
  offset.value = Math.max(0, offset.value - limit.value)
  fetchPokemons()
}

const selectPokemon = (pokemon) => {
  selectedPokemon.value = pokemon
}

const closeModal = () => {
  selectedPokemon.value = null
}

const getTypeColor = (type) => POKEMON_TYPE_COLORS[type] || DEFAULT_COLOR

</script>

<template>
  <Header />

  <main class="container" ref="mainRef">
    <div class="controls">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search Pokemon on this page..." 
        class="search-bar"
      />
    </div>

    <div v-if="loading && pokemons.length === 0" class="status-message">
      <p>Loading Pokédex...</p>
    </div>

    <div v-else-if="error" class="status-message error">
      <p>{{ error }}</p>
      <button @click="fetchPokemons">Retry</button>
    </div>

    <div v-else class="grid">
      <PokemonCard
        v-for="pokemon in filteredPokemons"
        :key="pokemon.id"
        :id="pokemon.id"
        :name="pokemon.name"
        :image="pokemon.image"
        @select="selectPokemon(pokemon)"
      />
      <p v-if="filteredPokemons.length === 0 && !loading" class="no-results">
        No Pokemon found matching "{{ searchQuery }}"
      </p>
    </div>
  </main>

  <div v-if="selectedPokemon" class="modal-overlay" @click="closeModal">
    <div class="pokemon-details" @click.stop>
      <img class="pokemon-img" :src="selectedPokemon.image" :alt="selectedPokemon.name" />
      <h2>{{ selectedPokemon.name }}</h2>

      <div class="types">
        <span
          v-for="type in selectedPokemon.types"
          :key="type"
          class="type-badge"
          :style="{ background: getTypeColor(type) }"
        >
          {{ type }}
        </span>
      </div>

      <div class="stats" v-if="selectedPokemon.stats">
        <div v-for="stat in selectedPokemon.stats" :key="stat.name" class="stat-row">
          <span class="stat-name">{{ stat.name }}</span>
          <div class="stat-bar-container">
            <div class="stat-bar" :style="{ width: `${(stat.value / 255) * 100}%` }"></div>
          </div>
          <span class="stat-value">{{ stat.value }}</span>
        </div>
      </div>

      <button class="close-btn" @click="closeModal">Close</button>
    </div>
  </div>

  <footer class="pagination">
    <button @click="prevPage" :disabled="offset === 0">
      ◀ Previous
    </button>
    <span class="page-info">Pokemons {{ offset + 1 }} - {{ offset + pokemons.length }}</span>
    <button @click="nextPage" :disabled="pokemons.length < limit">
      Next ▶
    </button>
  </footer>
</template>

<style>
body {
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.container {
  min-height: calc(100vh - 160px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.search-bar {
  padding: 12px 20px;
  width: 100%;
  max-width: 400px;
  border-radius: 25px;
  border: 1px solid #ddd;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.search-bar:focus {
  border-color: #ef5350;
}

.status-message {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.status-message.error {
  color: #d32f2f;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #666;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.pokemon-details {
  background-color: #ffffff;
  padding: 32px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  position: relative;
}

.pokemon-details h2 {
  text-transform: capitalize;
  margin: 16px 0;
  font-size: 2rem;
}

.types {
  margin: 16px 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.type-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: white;
  text-transform: capitalize;
  font-weight: 500;
}

.stats {
  margin: 24px 0;
  text-align: left;
}

.stat-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.stat-name {
  width: 80px;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #666;
}

.stat-bar-container {
  flex-grow: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  background: #ef5350;
  border-radius: 4px;
}

.stat-value {
  width: 30px;
  font-size: 0.9rem;
  font-weight: bold;
  text-align: right;
}

.close-btn {
  margin-top: 16px;
  padding: 10px 30px;
  border-radius: 25px;
  border: none;
  background: #ef5350;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.close-btn:hover {
  background: #d32f2f;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 30px 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

.page-info {
  font-weight: 500;
  color: #666;
}

.pagination button {
  padding: 10px 24px;
  border-radius: 25px;
  border: none;
  background: #ef5350;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.pagination button:hover:not(:disabled) {
  background: #d32f2f;
  transform: translateY(-2px);
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pokemon-img {
  width: 220px;
  height: 220px;
  object-fit: contain;
  display: block;
  margin: 0 auto 16px;
  filter: drop-shadow(0 5px 15px rgba(0,0,0,0.15));
}
</style>
