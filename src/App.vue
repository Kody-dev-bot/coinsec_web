<script lang="ts" setup>
import { onMounted } from 'vue'

onMounted(() => {
  console.log('App mounted, checking token:', localStorage.getItem('tokenValue'))
})
</script>

<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style scoped>
</style>