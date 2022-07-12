<template>
<div class="user-card-list">
  <el-card class="user-card" v-for="user in users" :key="user.id">
    <template #header>
      <div class="card-header">
        <span>{{user.nickname}}</span>
      </div>
    </template>
    <div v-for="o in 4" :key="o" class="text item">
      {{'列表内容 ' + o }}
    </div>
  </el-card>
</div>
</template>
<script lang="ts">

import { defineComponent, reactive } from 'vue'

export default defineComponent({
  name: 'userlist',
  setup () {
    const users = reactive([
      {
        id: 1,
        username: 'whimsy',
        avatar: '/3/dsad/dasd',
        nickname: 'www'
      }
    ])
    return {
      users
    }
  }
})
</script>
