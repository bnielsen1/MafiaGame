<script>

let lastColor = "--background-2";

export default {
  props: {
    phases: {
      type: Array,
      default: []
    },
    phaseIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      messages: [],
      lastMesageUser: "",
      typedMessage: ""
    }
  },
  computed: {
    currentPhase() {
      return this.phases[this.phaseIndex];
    },
  },
  methods: {
    isNewUser(currentUser, index) {
      if (index === 0) {
        return false;
      }

      // see if its a new user
      const previousUser = this.currentPhase.messages[index - 1].username;
      const output = currentUser !== previousUser;
      
      // flip color if it is new
      if (output) {
        this.flipColor();
      }

      return output;
    },
    flipColor() {
      if (lastColor === "--background-5") {
        lastColor = "--background-2"
      } else {
        lastColor = "--background-5"
      }
    },
    getChatBackgroundColor() {
      return `var(${lastColor})`
    }
  }
}

</script>

<template>

<div class="chat-section">
  <div class="messages-container">
    <div class="chat-box">
      <div class="message" 
        v-for="(message, index) in currentPhase.messages"
        :style="{
          borderTop: isNewUser(message.username, index) ? '#2b292e solid 1px' : 'none',
          backgroundColor: getChatBackgroundColor()
        }"
      >
        <div class="username-text">
          {{ message.username }}
        </div>
        <div class="contents-text">
          {{ message.message }}
        </div>
      </div>
    </div>
  </div>
  <form class="input-box">
    <input class="user-message-input"/>
    <button class="user-message-submit">
      Send
    </button>
  </form>
</div>

</template>


<style scoped>

.contents-text {
  min-width: 0;
  color: var(--text-primary);
  overflow-wrap: break-word;
}

.username-text {
  padding-right: 3px;
  color: var(--text-secondary);
  font-weight: bold;
}

input {
  flex-grow: 1;
  background-color: var(--background-1);
  color: var(--text-primary);
  border-style: solid;
  border-color: var(--background-2);
  border-radius: 6px;

  padding: 10px;
  margin-right: 8px;

  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: var(--primary);
}

button {
  width: 100px;
  font-weight: bold;
  outline: none;
  background-color: var(--primary);
  border-color: var(--background-1);
  border-radius: 6px;
}

button:hover {
  outline: none;
  background-color: var(--secondary);
  border-color: var(--text-primary);
}

.input-box {
  display: flex;
  height: 50px;
  width: 100%;
  padding: 8px;
  width: auto;
  flex-direction: row;
  background-color: var(--background-4);
}

.message {
  display: flex;
  width: 100%;
  flex-direction: row;
  padding: 6px;
  box-sizing: border-box;
}

.contents-text {
  padding-left: 3px;
}

.chat-box {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  background-color: var(--background-1);
}

.messages-container {
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 100%;
  overflow: hidden;
}

.chat-section {
  display: flex;
  flex-direction: column;

  overflow-y: hidden;
  width: 100%;
  flex-grow: 1;
}

</style>