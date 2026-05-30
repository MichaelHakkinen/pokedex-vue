<script setup>
</script>

<template>
  <header class="main-header">
    <div class="header-content">
      <div class="logo">
        <div class="pokeball"></div>
        <h1>Pokédex</h1>
      </div>
    </div>
  </header>
</template>

<style scoped>
.main-header {
  background-color: #ef5350;
  color: white;
  padding: 0 20px;
  height: 80px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pokeball {
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  position: relative;
  border: 3px solid #333;
  overflow: hidden;
}

.pokeball::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 50%;
  background: #ef5350;
  border-bottom: 3px solid #333;
}

.pokeball::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  border: 3px solid #333;
}

h1 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 1px;
}
</style>
