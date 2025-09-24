<script>

export default {
  props: {
    phases: {
      type: Array,
      default: []
    },
    phaseIndex: {
      type: Number,
      default: 0
    },
    updatePhaseIndex: {
      type: Function,
      required: true
    }
  },
  computed: {
    currentPhase() {
      return this.phases[this.phaseIndex];
    },
    dayStatusText() {
      if (this.phases[this.phaseIndex].dayTime) {
        return "DAY"
      } else {
        return "NIGHT"
      }
    }
  }
}

</script>


<template>
<div class="phase-info-container">
  <div class="formatted-container">
    <div class="phase-status">
      {{ dayStatusText }}: {{ currentPhase.number }}
    </div>
  </div>
  <div class="formatted-container">
    <button @click="updatePhaseIndex(-1)"><</button>
  </div>
  <div class="formatted-container">
    <button @click="updatePhaseIndex(1)">></button>
  </div>

</div>
</template>


<style scoped>

.phase-status {
  width: 100px;
}

.formatted-container {
  display: flex;
  flex-direction: row;
  background-color: var(--background-2);
  font-size: 14px;
  color: var(--text-primary);
  padding-left: 4px;
  padding-right: 4px;
  text-align: center;
  align-items: center;
  justify-content: center;
}

button {
  all: unset;

  height: 20px;
  width: 20px;

  background-color: var(--background-1);
  color: var(--text-secondary);
  border: var(--background-4) solid 2px;
  border-radius: 8px;


  cursor: pointer;
  transition: background-color 0.3s ease;

  -webkit-user-select: none; /* For Chrome, Safari, and Opera */
  -moz-user-select: none;    /* For Firefox */
  -ms-user-select: none;     /* For Internet Explorer and Edge */
  user-select: none;         /* Standard property */
}

button:hover {
  background-color: var(--background-2);
}

.phase-info-container {
  display: flex;
  flex-direction: row;
  background-color: var(--background-2);
}

</style>