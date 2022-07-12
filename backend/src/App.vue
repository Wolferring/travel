<template>
  <navigation></navigation>
  <router-view/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import Navigation from './components/Navigation.vue'
export default defineComponent({
  components: {
    navigation: Navigation
  },
  setup(){
    
  }
})
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
