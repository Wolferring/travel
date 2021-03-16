<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/user">User</router-link>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'navigation'
})
</script>
