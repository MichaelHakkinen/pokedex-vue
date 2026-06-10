<script setup>
import { POKEMON_TYPE_COLORS, DEFAULT_COLOR } from '@/constants'

const props = defineProps({
  id:    { type: Number,  required: true },
  name:  { type: String,  required: true },
  image: { type: String,  default: '' },
  types: { type: Array,   default: () => [] },
})

defineEmits(['select'])

const getTypeColor = (type) => POKEMON_TYPE_COLORS[type] || DEFAULT_COLOR
const capitalize   = (s)    => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
// Pick the primary type colour for the card tint
const primaryColor = props.types[0] ? getTypeColor(props.types[0]) : '#ef5350'
</script>

<template>
  <div
    class="card"
    :style="{ '--tc': primaryColor }"
    @click="$emit('select')"
    role="button"
    :aria-label="`View ${name}`"
  >
    <!-- Image area with type-colour gradient bg -->
    <div class="card-img-wrap">
      <img :src="image" :alt="name" loading="lazy" class="card-img" />
    </div>

    <!-- Info -->
    <div class="card-info">
      <span class="poke-id">#{{ id.toString().padStart(3, '0') }}</span>
      <h3 class="poke-name">{{ capitalize(name) }}</h3>
      <div class="type-row">
        <span
          v-for="type in types"
          :key="type"
          class="type-chip"
          :style="{ background: getTypeColor(type) }"
        >{{ capitalize(type) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  box-shadow: 0 3px 10px rgba(0,0,0,0.07);
  transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease;
  border: 1.5px solid transparent;
}
.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0,0,0,0.14);
  border-color: var(--tc, #ef5350);
}

.card-img-wrap {
  background: linear-gradient(160deg, color-mix(in srgb, var(--tc) 18%, #fff) 0%, #f0f4f8 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 10px 8px;
  min-height: 130px;
}
.card-img {
  width: 110px;
  height: 110px;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.13));
  transition: transform 0.25s ease;
}
.card:hover .card-img { transform: scale(1.1) translateY(-4px); }

.card-info {
  padding: 10px 12px 14px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.poke-id {
  font-size: 0.72rem;
  font-weight: 700;
  color: #bbb;
  letter-spacing: 0.5px;
}
.poke-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a2e;
  text-transform: capitalize;
  margin: 0;
}
.type-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}
.type-chip {
  padding: 2px 9px;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #fff;
  text-transform: capitalize;
  letter-spacing: 0.2px;
}
</style>
