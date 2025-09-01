<script setup lang="ts">
</script>

<template>
  <div id="app">
    <div>
      <router-link to="/">登录</router-link> |
      <router-link to="/home">首页</router-link> |
      <router-link to="/about">关于</router-link>
    </div>
    <div>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
</style>
