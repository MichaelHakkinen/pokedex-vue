<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
const gridRef = ref(null)
const cardSize = ref({ width: 160, height: 200 })

const mainRef = ref(null)

async function measureCard() {
  await nextTick()

  const card = document.querySelector('.card')
  if (!card) return

  const rect = card.getBoundingClientRect()
  cardSize.value = {
    width: rect.width,
    height: rect.height
  }
}


const handleResize = async () => {
  await measureCard()
  calculateLimit()
  fetchPokemons()
}

onMounted(async () => {
  await fetchPokemons()
  await measureCard()
  calculateLimit()
  fetchPokemons()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})


import Header from '@/components/Header.vue'
import PokemonCard from '@/components/PokemonCard.vue'

const pokemons = ref([])
const loading = ref(true)
const selectedPokemon = ref(null)

const limit = ref(12)

function calculateLimit() {
  if (!mainRef.value) return

  const availableHeight = mainRef.value.clientHeight
  const rows = Math.floor(
    availableHeight / cardSize.value.height
  )

  const estimatedColumns = Math.floor(
    window.innerWidth / cardSize.value.width
  )

  limit.value = Math.max(rows * estimatedColumns, estimatedColumns)
}


const offset = ref(0)

const fetchPokemons = async () => {
  loading.value = true

  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon?limit=${limit.value}&offset=${offset.value}`
  )

  const data = await response.json()

  const results = await Promise.all(
    data.results.map(async (pokemon) => {
      const res = await fetch(pokemon.url)
      const details = await res.json()

      return {
        id: details.id,
        name: details.name,
        image: details.sprites.front_default,
        types: details.types.map(t => t.type.name)
      }
    })
  )

  pokemons.value = results
  loading.value = false
}

const nextPage = () => {
  offset.value += limit.value
  fetchPokemons()
}

const prevPage = () => {
  if (offset.value === 0) return
  offset.value -= limit.value
  fetchPokemons()
}

const selectPokemon = (pokemon) => {
  selectedPokemon.value = pokemon
}

const closeModal = () => {
  selectedPokemon.value = null
}

const typeColors = {
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  poison: '#A040A0',
  bug: '#A8B820',
  normal: '#A8A878',
  ground: '#E0C068',
  fairy: '#EE99AC',
  fighting: '#C03028',
  psychic: '#F85888',
  rock: '#B8A038',
  ghost: '#705898',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0'
}

const getTypeColor = (type) => typeColors[type] || '#777'

</script>

<template>
  <Header/>

  <main class="container" ref="mainRef">
    <p v-if="loading">Loading Pokémon...</p>

    <div v-else class="grid" ref="gridRef">
      <PokemonCard
        v-for="pokemon in pokemons"
        :key="pokemon.id"
        :id="pokemon.id"
        :name="pokemon.name"
        :image="pokemon.image"
        @select="selectPokemon(pokemon)"
      />
    </div>
  </main>

  <!-- MODAL -->
  <div v-if="selectedPokemon" class="modal-overlay" @click="closeModal">
    <div class="modal modern" @click.stop>
      <img class="pokemon-img" :src="selectedPokemon.image" />
      <h2>{{ selectedPokemon.name }}</h2>

      <div class="types">
        <span
          v-for="type in selectedPokemon.types"
          :key="type"
          class="type"
          :style="{ background: getTypeColor(type) }"
        >
          {{ type }}
        </span>
      </div>

      <button class="close" @click="closeModal">Close</button>
    </div>
  </div>

  <div class="pagination">
    <button @click="prevPage" :disabled="offset === 0">
      ◀ Previous
    </button>
    <button @click="nextPage">
      Next ▶
    </button>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

.container {
  height: calc(100vh - 80px - 80px);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  padding: 16px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.types {
  margin: 12px 0;
}

.modal.modern {
  background-color: #ffffff;
  opacity: 1;
  color: #333;
  padding: 24px;
  border-radius: 16px;
  width: 300px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
}

.modal.modern h2 {
  text-transform: capitalize;
  margin: 12px 0;
}

.type {
  padding: 6px 12px;
  border-radius: 999px;
  margin: 4px;
  display: inline-block;
  font-size: 12px;
  color: white;
  text-transform: capitalize;
}

.close {
  margin-top: 16px;
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  background: #ef5350;
  color: white;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 24px 0;
}

.pagination button {
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: #ef5350;
  color: white;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pokemon-img {
  width: 160px;
  margin: 0 auto 12px;
  display: block;
}
</style>
