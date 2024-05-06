<template>
  <div style="display: flex; justify-content: flex-end; padding: 1rem; border: none">
    <div style="flex-grow: 1; display: flex; justify-content: flex-start">
      <div style="padding-right: 1rem">
        <p style="line-height: 2rem; color: white">Page {{ page }}</p>
      </div>
      <div style="padding-right: 1rem; display: flex">
        <p style="line-height: 2rem; color: white">Show:&nbsp;&nbsp;</p>
        <div style="display: flex; height: 2rem" class="custom-select-wrapper">
          <select v-model="pageSizeData" class="custom-select" style="width: 4rem">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="40">40</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>
      <div style="padding-right: 1rem; display: flex">
        <p style="line-height: 2rem; color: white">Go to page:&nbsp;&nbsp;</p>
        <input type="number" v-model="pageData" class="inputBox" />
      </div>
    </div>
    <div style="flex-grow: 1; display: flex; justify-content: flex-end">
      <button class="pageBtn" :disabled="page <= 1" @click="pageData--">
        <span class="mdi mdi-chevron-left"></span>
      </button>
      <button class="pageBtn" :disabled="!hasNextPage" @click="pageData++">
        <span class="mdi mdi-chevron-right"></span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { debounce } from 'lodash'
export default {
  name: 'CustomPaginationComponent',
  props: {
    page: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true
    },
    itemCount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      pageSizeData: this.pageSize,
      pageData: this.page
    }
  },
  watch: {
    pageSizeData: {
      handler: debounce(function () {
        this.pageSizeUpdate(this.pageSizeData)
      }, 150),
      deep: true
    },
    pageData: {
      handler: debounce(function () {
        if (this.pageData < 1 || this.pageData == null)
          this.pageData = 1 // Thjis should trigger watcher again
        else this.pageUpdate(this.pageData)
      }, 300),
      deep: true
    }
  },
  methods: {
    pageUpdate(page: number) {
      this.$emit('update-page', page.toString())
    },
    pageSizeUpdate(pageSize: number) {
      this.$emit('update-pageSize', pageSize.toString())
    }
  },
  computed: {
    hasNextPage() {
      return this.itemCount > this.pageSize
    }
  }
}
</script>

<style scoped>
.pageBtn {
  background-color: white;
  border: 1px solid black;
  width: 2rem;
  height: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.pageBtn:disabled {
  pointer-events: none;
  background-color: #909090;
  cursor: default;
}

.pageBtn:hover {
  background-color: #909090;
  cursor: pointer;
}

.mdi {
  font-size: 1.5rem;
  /* Adjust the size as needed */
  color: black;
  /* Adjust the color as needed */
}

.custom-select-wrapper {
  position: relative;
}

.custom-select {
  appearance: none;
  /* Remove default styling */
  flex-grow: 1;
  background-color: white;
  border: 1px solid #ced4da;
  /* Add custom border */
  border-radius: 0.25rem;
  /* Optional: round the corners */
  position: relative;
  -webkit-appearance: none;
  /* For Safari */
  padding-left: 0.3rem;
  padding-right: 0.3rem;
}

.custom-select-wrapper::after {
  content: '▼';
  /* Add arrow icon */
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  /* Prevent the arrow from being clickable */
  color: #343a40;
  /* Arrow color */
}

.inputBox {
  background-color: white;
  border-radius: 4px;
  padding-left: 0.3rem;
  padding-right: 0.3rem;
  width: 4rem;
}
</style>
