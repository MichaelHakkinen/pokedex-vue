<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import Header from '@/components/Header.vue'
import PokemonCard from '@/components/PokemonCard.vue'
import { POKEMON_TYPE_COLORS, DEFAULT_COLOR, REGIONS, ALL_TYPES } from './constants'

// ── state ──────────────────────────────────────────────────────────────────
const pokemons      = ref([])
const loading       = ref(false)
const error         = ref(null)
const selectedPokemon = ref(null)
const detailLoading = ref(false)

const searchQuery   = ref('')
const selectedRegion = ref(REGIONS[0])   // default: National
const selectedType  = ref('all')
const shiny         = ref(false)

const currentOffset = ref(0)
const pageSize      = ref(24)
const totalInRegion = computed(() => selectedRegion.value.count)

// ── region helpers ──────────────────────────────────────────────────────────
const switchRegion = (region) => {
  selectedRegion.value = region
  currentOffset.value  = 0
  selectedType.value   = 'all'
  searchQuery.value    = ''
  loadPage()
}

// ── fetch a page of Pokémon ─────────────────────────────────────────────────
const loadPage = async () => {
  loading.value = true
  error.value   = null

  const reg    = selectedRegion.value
  const absOff = reg.offset + currentOffset.value
  const take   = Math.min(pageSize.value, reg.count - currentOffset.value)

  try {
    const listRes  = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${take}&offset=${absOff}`)
    if (!listRes.ok) throw new Error('Failed to fetch list')
    const listData = await listRes.json()

    const fetched = await Promise.allSettled(
      listData.results.map(async (p) => {
        const r = await fetch(p.url)
        if (!r.ok) return null
        const d = await r.json()
        return buildPokemon(d)
      })
    )
    pokemons.value = fetched
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const buildPokemon = (d) => ({
  id:          d.id,
  name:        d.name,
  image:       d.sprites.other['official-artwork'].front_default
                 || d.sprites.front_default,
  imageShiny:  d.sprites.other['official-artwork'].front_shiny
                 || d.sprites.front_shiny,
  types:       d.types.map(t => t.type.name),
  stats:       d.stats.map(s => ({ name: s.stat.name, value: s.base_stat })),
  height:      d.height,
  weight:      d.weight,
  abilities:   d.abilities.map(a => a.ability.name),
  baseExp:     d.base_experience,
})

// ── filter ──────────────────────────────────────────────────────────────────
const filteredPokemons = computed(() => {
  let list = pokemons.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.id.toString().includes(q)
    )
  }
  if (selectedType.value !== 'all') {
    list = list.filter(p => p.types.includes(selectedType.value))
  }
  return list
})

// ── pagination ──────────────────────────────────────────────────────────────
const canPrev = computed(() => currentOffset.value > 0)
const canNext = computed(() => currentOffset.value + pageSize.value < totalInRegion.value)
const pageLabel = computed(() => {
  const from = selectedRegion.value.offset + currentOffset.value + 1
  const to   = selectedRegion.value.offset + Math.min(currentOffset.value + pageSize.value, totalInRegion.value)
  return `#${from} – #${to}`
})

const prevPage = () => {
  currentOffset.value = Math.max(0, currentOffset.value - pageSize.value)
  loadPage()
}
const nextPage = () => {
  currentOffset.value += pageSize.value
  loadPage()
}

// ── modal ───────────────────────────────────────────────────────────────────
const selectPokemon = async (pokemon) => {
  selectedPokemon.value = { ...pokemon }
  detailLoading.value   = true
  // Fetch species for flavor text & generation
  try {
    const specRes  = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
    if (specRes.ok) {
      const spec = await specRes.json()
      const eng  = spec.flavor_text_entries.find(e => e.language.name === 'en')
      selectedPokemon.value.flavor  = eng ? eng.flavor_text.replace(/\f|\n/g, ' ') : ''
      selectedPokemon.value.genus   = spec.genera.find(g => g.language.name === 'en')?.genus || ''
      selectedPokemon.value.gen     = spec.generation?.name.replace('generation-', 'Gen ').toUpperCase() || ''
      selectedPokemon.value.captureRate = spec.capture_rate
    }
  } catch (e) {}
  detailLoading.value = false
}
const closeModal = () => { selectedPokemon.value = null }

// ── helpers ─────────────────────────────────────────────────────────────────
const getTypeColor = (type) => POKEMON_TYPE_COLORS[type] || DEFAULT_COLOR
const capitalize   = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const statShort    = (name) => ({
  'hp': 'HP', 'attack': 'ATK', 'defense': 'DEF',
  'special-attack': 'SpA', 'special-defense': 'SpD', 'speed': 'SPD'
})[name] || name.toUpperCase()
const statColor    = (v) => v >= 100 ? '#4CAF50' : v >= 60 ? '#FF9800' : '#ef5350'

// ── keyboard shortcuts ───────────────────────────────────────────────────────
const onKey = (e) => { if (e.key === 'Escape') closeModal() }

// ── lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  loadPage()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Header />

  <!-- ── Region / Generation tabs ── -->
  <nav class="region-nav">
    <div class="region-tabs">
      <button
        v-for="reg in REGIONS"
        :key="reg.id"
        class="region-tab"
        :class="{ active: selectedRegion.id === reg.id }"
        @click="switchRegion(reg)"
      >
        {{ reg.label }}
        <span class="reg-count">{{ reg.count }}</span>
      </button>
    </div>
  </nav>

  <!-- ── Controls bar ── -->
  <div class="controls-bar">
    <!-- Search -->
    <div class="search-wrap">
      <svg class="search-icon" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
      <input
        v-model="searchQuery"
        type="search"
        :placeholder="`Search in ${selectedRegion.label}…`"
        class="search-input"
      />
    </div>

    <!-- Type filter pills -->
    <div class="type-pills">
      <button
        v-for="type in ALL_TYPES"
        :key="type"
        class="type-pill"
        :class="{ active: selectedType === type }"
        :style="type !== 'all' && selectedType === type
          ? { background: getTypeColor(type), color: '#fff', borderColor: getTypeColor(type) }
          : type !== 'all' ? { borderColor: getTypeColor(type), color: getTypeColor(type) } : {}"
        @click="selectedType = type"
      >
        {{ type === 'all' ? '✦ All types' : capitalize(type) }}
      </button>
    </div>

    <!-- Shiny toggle -->
    <label class="shiny-toggle" :class="{ on: shiny }">
      <input type="checkbox" v-model="shiny" style="display:none" />
      ✨ Shiny
    </label>
  </div>

  <!-- ── Grid ── -->
  <main class="grid-wrap">
    <div v-if="loading" class="status">
      <div class="pokeball-spin"></div>
      <p>Loading Pokédex…</p>
    </div>

    <div v-else-if="error" class="status error">
      <p>⚠ {{ error }}</p>
      <button class="btn-red" @click="loadPage">Retry</button>
    </div>

    <template v-else>
      <div class="poke-grid">
        <PokemonCard
          v-for="pokemon in filteredPokemons"
          :key="pokemon.id"
          :id="pokemon.id"
          :name="pokemon.name"
          :image="shiny ? pokemon.imageShiny : pokemon.image"
          :types="pokemon.types"
          @select="selectPokemon(pokemon)"
        />
        <p v-if="filteredPokemons.length === 0" class="no-results">
          No Pokémon found for <em>{{ searchQuery || selectedType }}</em> in {{ selectedRegion.label }}
        </p>
      </div>

      <!-- Pagination -->
      <footer class="pagination">
        <button class="btn-red" @click="prevPage" :disabled="!canPrev">◀ Prev</button>
        <span class="page-info">
          <strong>{{ selectedRegion.label }}</strong> &nbsp;·&nbsp; {{ pageLabel }}
          <span class="total-badge">/ {{ totalInRegion }} Pokémon</span>
        </span>
        <button class="btn-red" @click="nextPage" :disabled="!canNext">Next ▶</button>
      </footer>
    </template>
  </main>

  <!-- ── Detail Modal ── -->
  <Transition name="modal-fade">
    <div v-if="selectedPokemon" class="modal-overlay" @click="closeModal">
      <div
        class="modal-card"
        :style="{ '--type-color': getTypeColor(selectedPokemon.types[0]) }"
        @click.stop
      >
        <!-- Header band -->
        <div class="modal-header-band">
          <div>
            <span class="modal-gen">{{ selectedPokemon.gen }}</span>
            <span class="modal-genus">{{ selectedPokemon.genus }}</span>
          </div>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>

        <!-- Image -->
        <div class="modal-img-wrap">
          <img
            :src="shiny ? selectedPokemon.imageShiny : selectedPokemon.image"
            :alt="selectedPokemon.name"
            class="modal-img"
          />
        </div>

        <!-- Name + ID -->
        <p class="modal-num">#{{ selectedPokemon.id.toString().padStart(3, '0') }}</p>
        <h2 class="modal-name">{{ capitalize(selectedPokemon.name) }}</h2>

        <!-- Types -->
        <div class="modal-types">
          <span
            v-for="type in selectedPokemon.types"
            :key="type"
            class="type-badge"
            :style="{ background: getTypeColor(type) }"
          >{{ capitalize(type) }}</span>
        </div>

        <!-- Flavor text -->
        <p v-if="selectedPokemon.flavor" class="modal-flavor">{{ selectedPokemon.flavor }}</p>

        <!-- Bio row -->
        <div class="modal-bio">
          <div class="bio-item">
            <span class="bio-label">Height</span>
            <span class="bio-val">{{ (selectedPokemon.height / 10).toFixed(1) }} m</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">Weight</span>
            <span class="bio-val">{{ (selectedPokemon.weight / 10).toFixed(1) }} kg</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">Base EXP</span>
            <span class="bio-val">{{ selectedPokemon.baseExp ?? '—' }}</span>
          </div>
          <div class="bio-item">
            <span class="bio-label">Catch Rate</span>
            <span class="bio-val">{{ selectedPokemon.captureRate ?? '…' }}</span>
          </div>
        </div>

        <!-- Abilities -->
        <div class="modal-abilities">
          <span class="section-label">Abilities</span>
          <span
            v-for="ab in selectedPokemon.abilities"
            :key="ab"
            class="ability-tag"
          >{{ capitalize(ab.replace('-', ' ')) }}</span>
        </div>

        <!-- Stats -->
        <div class="modal-stats">
          <span class="section-label">Base Stats</span>
          <div
            v-for="stat in selectedPokemon.stats"
            :key="stat.name"
            class="stat-row"
          >
            <span class="stat-name">{{ statShort(stat.name) }}</span>
            <div class="stat-track">
              <div
                class="stat-fill"
                :style="{ width: `${Math.min(100, (stat.value / 255) * 100)}%`, background: statColor(stat.value) }"
              ></div>
            </div>
            <span class="stat-val">{{ stat.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
/* ── Reset & base ─────────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: #f0f4f8;
  color: #1a1a2e;
  min-height: 100vh;
}

/* ── Region nav ───────────────────────────────────────────────────────────── */
.region-nav {
  background: #fff;
  border-bottom: 2px solid #ef5350;
  overflow-x: auto;
  position: sticky;
  top: 80px;          /* below header */
  z-index: 90;
  -webkit-overflow-scrolling: touch;
}
.region-tabs {
  display: flex;
  gap: 2px;
  padding: 8px 20px 0;
  min-width: max-content;
}
.region-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-bottom: 3px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  white-space: nowrap;
  transition: all 0.2s;
  border-radius: 6px 6px 0 0;
}
.region-tab:hover { background: #fef2f2; color: #ef5350; }
.region-tab.active {
  color: #ef5350;
  border-bottom-color: #ef5350;
  background: #fef2f2;
}
.reg-count {
  font-size: 0.72rem;
  background: #ef535022;
  color: #ef5350;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}
.region-tab.active .reg-count { background: #ef5350; color: #fff; }

/* ── Controls bar ─────────────────────────────────────────────────────────── */
.controls-bar {
  max-width: 1280px;
  margin: 20px auto 0;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-wrap {
  position: relative;
  max-width: 500px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #aaa;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 12px 20px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.95rem;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input:focus {
  border-color: #ef5350;
  box-shadow: 0 0 0 3px rgba(239,83,80,0.12);
}

.type-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.type-pill {
  padding: 5px 13px;
  border-radius: 20px;
  border: 1.5px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.18s;
  text-transform: capitalize;
}
.type-pill:hover { filter: brightness(0.92); }
.type-pill.active { color: #fff !important; border-color: transparent !important; }
/* override "all" active */
.type-pill:first-child.active { background: #ef5350; }

.shiny-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  color: #666;
  width: fit-content;
  transition: all 0.2s;
  user-select: none;
}
.shiny-toggle.on {
  border-color: #fbbf24;
  background: linear-gradient(135deg,#fef9c3,#fde68a);
  color: #92400e;
}

/* ── Grid ─────────────────────────────────────────────────────────────────── */
.grid-wrap {
  max-width: 1280px;
  margin: 20px auto;
  padding: 0 20px 80px;
}
.poke-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 18px;
}
.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  font-size: 1.1rem;
  color: #888;
}

/* ── Status / loading ─────────────────────────────────────────────────────── */
.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  font-size: 1.1rem;
  color: #666;
}
.status.error { color: #ef5350; }
.pokeball-spin {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 5px solid #ef5350;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Buttons ──────────────────────────────────────────────────────────────── */
.btn-red {
  padding: 10px 26px;
  border-radius: 25px;
  border: none;
  background: #ef5350;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.btn-red:hover:not(:disabled) { background: #d32f2f; transform: translateY(-2px); }
.btn-red:disabled { background: #ccc; cursor: not-allowed; }

/* ── Pagination ───────────────────────────────────────────────────────────── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 36px;
  padding: 24px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
}
.page-info {
  text-align: center;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}
.total-badge {
  display: inline-block;
  font-size: 0.78rem;
  color: #aaa;
  margin-left: 4px;
}

/* ── Modal ────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}
.modal-card {
  background: #fff;
  border-radius: 24px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-header-band {
  background: var(--type-color, #ef5350);
  border-radius: 24px 24px 0 0;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: rgba(255,255,255,0.9);
}
.modal-gen {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  opacity: 0.85;
}
.modal-genus {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 2px;
}
.modal-close {
  background: rgba(255,255,255,0.25);
  border: none;
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.modal-close:hover { background: rgba(255,255,255,0.45); }

.modal-img-wrap {
  background: linear-gradient(180deg, var(--type-color, #ef5350)22 0%, #fff 60%);
  display: flex;
  justify-content: center;
  padding: 16px 0 0;
}
.modal-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  filter: drop-shadow(0 8px 20px rgba(0,0,0,0.18));
  transition: transform 0.3s;
}
.modal-img:hover { transform: scale(1.06); }

.modal-num {
  text-align: center;
  color: #aaa;
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: 10px;
}
.modal-name {
  text-align: center;
  font-size: 2rem;
  font-weight: 800;
  text-transform: capitalize;
  color: #1a1a2e;
  margin: 4px 0 12px;
}
.modal-types {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}
.type-badge {
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 0.82rem;
  color: #fff;
  font-weight: 700;
  text-transform: capitalize;
  letter-spacing: 0.3px;
}
.modal-flavor {
  margin: 0 20px 16px;
  padding: 12px 14px;
  background: #f8f9fa;
  border-radius: 10px;
  font-size: 0.85rem;
  color: #555;
  line-height: 1.55;
  font-style: italic;
  text-align: center;
}
.modal-bio {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 8px;
  padding: 0 20px 16px;
}
.bio-item {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 10px 6px;
  text-align: center;
}
.bio-label {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  color: #999;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.bio-val {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a1a2e;
}

.modal-abilities {
  padding: 0 20px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.section-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #aaa;
  font-weight: 700;
  letter-spacing: 0.8px;
  width: 100%;
  margin-bottom: 2px;
}
.ability-tag {
  background: #f0f4f8;
  border: 1px solid #e2e8f0;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
  text-transform: capitalize;
}

.modal-stats {
  padding: 0 20px 24px;
}
.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 7px;
}
.stat-name {
  width: 36px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  text-align: right;
  flex-shrink: 0;
}
.stat-track {
  flex: 1;
  height: 7px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}
.stat-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}
.stat-val {
  width: 28px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: right;
  color: #333;
}

/* ── Transition ───────────────────────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-card { transform: scale(0.9) translateY(20px); }
.modal-fade-leave-to .modal-card { transform: scale(0.9) translateY(20px); }

/* ── Scrollbar ────────────────────────────────────────────────────────────── */
.modal-card::-webkit-scrollbar { width: 5px; }
.modal-card::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
.region-nav::-webkit-scrollbar { height: 3px; }
.region-nav::-webkit-scrollbar-thumb { background: #ef5350; border-radius: 2px; }
</style>
