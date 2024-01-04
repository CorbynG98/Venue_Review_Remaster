<template>
  <div class="signin">
    <h1>This is the signin page</h1>
    <v-btn
      v-on:click="this.$store.commit('LOGIN', { username: 'CorbynG98', token: '123TESTING123' })"
      >Signin</v-btn
    >
  </div>
</template>

<style>
.signin {
  min-height: 100vh;
  padding: 1rem;
}
</style>
