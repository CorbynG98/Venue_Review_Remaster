<template>
  <div class="venue_details">
    <h1 style="color: white">This is the venue details view for {{this.$route.params.venue_id}}</h1>
  </div>
</template>

<script lang="ts">
export default {
  
}
</script>

<style>
.venue_details {
  min-height: 100vh;
  padding: 1rem;
}
</style>
