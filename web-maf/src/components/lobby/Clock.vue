<script>

export default {
  props: {
    timerDuration: {
      type: Number, // stored in ms
      default: 0
    },
    timerReset: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      timerObject: null, // stores the actual timer object
      timeRemaining: 0, // stored in seconds
    }
  },
  computed: {
    displayTime() {
      if (this.timerObject === null || this.timeRemaining === 0) {
        return '0:00'
      }

      const minutes = Math.floor(this.timeRemaining / 60);
      const seconds = this.timeRemaining % 60;
      if (seconds < 10) {
        return `${minutes}:0${seconds}`
      } else {
        return `${minutes}:${seconds}`;
      }
    }
  },
  watch: {
    timerReset: {
      handler() {
        this.resetTimer();
      }
    }
  },
  methods: {
    resetTimer() {
      if (this.timerObject !== null) {
	    clearInterval(this.timerObject);
	  }

      this.startTime = Date.now();
      const totalTime = Math.floor(this.timerDuration / 1000);

      this.timeRemaining = totalTime;
      this.timerObject = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.timeRemaining = totalTime - elapsed;

        if (this.timeRemaining < 0) {
          clearInterval(this.timerObject);
          this.timerObject = null;
          this.timeRemaining = 0;
        }
      }, 250);
    }
  }
}

</script>

<template>
<div class="clock-box">
  {{ displayTime }}
</div>
</template>

<style scoped>

.clock-box {
  display: flex;
  background-color: var(--background-2);
  font-size: 14px;
  color: white;
  padding: 4px;
  height: 30px;
  width: 50px;
  text-align: center;
  align-items: center;
  justify-content: center;
  /* border-left: 1px solid darkslategray;
  border-right: 1px solid darkslategray; */
}

</style>