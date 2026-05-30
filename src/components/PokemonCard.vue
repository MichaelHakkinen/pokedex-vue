<script setup>
defineProps({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  }
})

defineEmits(['select'])
</script>

<template>
  <div class="card" @click="$emit('select')">
    <div class="card-image-container">
      <img :src="image" :alt="name" loading="lazy" />
    </div>
    <div class="card-info">
      <span class="pokemon-id">#{{ id.toString().padStart(3, '0') }}</span>
      <h3 class="pokemon-name">{{ name }}</h3>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
}

.card-image-container {
  background-color: #f8f8f8;
  border-radius: 12px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px;
  box-sizing: border-box;
}

.card img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.card-info {
  width: 100%;
}

.pokemon-id {
  display: block;
  font-size: 0.8rem;
  color: #888;
  font-weight: 600;
  margin-bottom: 2px;
}

.pokemon-name {
  margin: 0;
  text-transform: capitalize;
  font-size: 1.1rem;
  color: #333;
}
</style>
