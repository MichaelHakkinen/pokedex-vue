<script setup>
defineProps({
  id: Number,
  name: String,
  image: String
})

const emit = defineEmits(['select'])

const handleClick = () => {
  emit('select')
}
</script>

<template>
  <div class="card" @click="$emit('select')">
    <img :src="image" />
    <p>{{ name }}</p>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  height: 200px; /* 🔥 STABLE HEIGHT */
  box-sizing: border-box;

  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
}

.card img {
  max-width: 120px;
  height: 120px;
  object-fit: contain;
}
</style>
