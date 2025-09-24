
<script>

import stringToColor from '@/utils/helpers';

export default {
props: {
  unstructuredPlayers: {
    type: Array,
    default: []
  }
},
data() {
  return {
    lines: [],
    players: []
  }
},
mounted() {
  this.refreshPositions();
},
watch: {
  unstructuredPlayers: {
    handler(newPlayers) {
      if (newPlayers.length !== 0) {
        this.restructurePlayers(newPlayers);
      } else {
        this.players = [];
      }
    },
    immediate: true // update on component creation
  }
},
methods: {
  restructurePlayers(passedPlayers) {
    this.players = [];
    passedPlayers.forEach((player) => {
      // Find the target from the first valid action
      var target = null;
      const validActions = player.role.actions.filter((action) => action.title === 'vote' || action.title === 'mafiaKill');
      validActions.forEach((action) => {
        if (target === null) {
          target = action.target;
        }
      })

      // Create a new simpler player object
      const newPlayer = {
        username: player.username,
        vote: target,
        color: stringToColor(player.username),
        position: {
          x: null,
          y: null
        }
      }

      this.players.push(newPlayer);
    })
  },
  refreshPositions() {
    // refresh player circle locations
    const playerCount = this.players.length;
    const magnitude = 300;
    this.players.forEach((player, index) => {
        const angle = (2 * Math.PI) * (index / playerCount)
        player.position.x = magnitude * Math.cos(angle);
        player.position.y = magnitude * Math.sin(angle);
    })

    // get svg dimensions for drawing lines
    var xOffset
    var yOffset

    xOffset = 350;
    yOffset = 350;

    // actual line refresh calculation
    this.lines = [];
    for (let i=0; i<this.players.length; i++) {
      for (let j=i+1; j<this.players.length; j++) { // so we don't get a duplicate pairing
        if (i === j) continue; // skip for same player iterations
        const p1 = this.players[i];
        const p2 = this.players[j];

        var p1votes = false;
        var p2votes = false;
        if (p1.vote === p2.username) p1votes = true;
        if (p2.vote === p1.username) p2votes = true;

        if (p1votes && !p2votes) { // p1 votes p2
          this.lines.push({
            id: p1.username,
            x1: p1.position.x + xOffset,
            y1: p1.position.y + yOffset,
            x2: p2.position.x + xOffset,
            y2: p2.position.y + yOffset,
            stroke: p1.color

          })
        } else if (!p1votes && p2votes) { // p2 votes p1
          this.lines.push({
            id: p2.username,
            x1: p2.position.x + xOffset,
            y1: p2.position.y + yOffset,
            x2: p1.position.x + xOffset,
            y2: p1.position.y + yOffset,
            stroke: p2.color
          })
        } else if (p1votes && p2votes) { // vote each other 
          this.lines.push({
            id: p1.username,
            x1: p1.position.x + xOffset + 5,
            y1: p1.position.y + yOffset + 5,
            x2: p2.position.x + xOffset + 5,
            y2: p2.position.y + yOffset + 5,
            stroke: p1.color
          })
          this.lines.push({
            id: p2.username,
            x1: p2.position.x + xOffset - 5,
            y1: p2.position.y + yOffset - 5,
            x2: p1.position.x + xOffset - 5,
            y2: p1.position.y + yOffset - 5,
            stroke: p2.color
          })
        }
        // Otherwise we don't have any lines between the two players
      }
    }
  },
  addPlayer() {
    // add the player
    this.players.push({
      username: `test${this.players.length}`,
      color: stringToColor(this.players.length),
      vote: `${this.players[this.players.length - 1].username}`,
      position: {
        x: null,
        y: null
      }
    });

    this.refreshPositions();
  },
  removePlayer() {
    this.players.pop();
    this.refreshPositions();
  }
}
}

</script>


<template>

<!-- <button @click="addPlayer()">add player</button>
<button @click="removePlayer()">remove player</button> -->
<div class="player-container" v-if="unstructuredPlayers.length > 0">
  <div
    class="player-circle"
    v-for="(player) in players"
    :key="player.username"
    :style="{
      transform: `translate(calc(-50% + ${player.position.x}px), calc(-50% + ${player.position.y}px))`,
      backgroundColor: player.color
    }"
  >
    <div class="player-contents">
      {{ player.username }}
    </div>
  </div>

  <div class="lines-container">
    <svg ref="lineSvg" class="vote-lines">
        <line
        class="vote-line"
        v-for="line in lines"
        :x1="line.x1"
        :y1="line.y1"
        :x2="line.x2"
        :y2="line.y2"
        :stroke="line.stroke"
        stroke-width="10"
        />
    </svg>
  </div>
</div>
<div class="player-container" v-else>
  Waiting for game start...
</div>

</template>


<style>

.player-container {
  --component-width: 800px;
  --component-height: 800px;

  position: relative;
  width: var(--component-width);
  height: var(--component-height);
  background-color: var(--background-1);
  color: white;

  display: flex;
  justify-content: center;
  align-items: center;

  border-left: var(--background-5) solid 2px;
  border-right: var(--background-5) solid 2px;
}

.lines-container {
  display: flex;
  justify-content: center;
  align-items: center;

  width: var(--component-width);
  height: var(--component-height);
}

.vote-lines {
  position: absolute;
  width: 700px;
  height: 700px;
  pointer-events: none;

  z-index: 1;
}

.player-circle {
  position: absolute;
  left: 50%;
  top: 50%; 
  width: 100px;
  height: 100px;
  border-radius: 50%;

  box-shadow: 4px 4px 8px black;
  z-index: 2;
}

.player-contents {
  display: flex;
  justify-content: center;
  align-items: center;


  transform: translate(0, 100%);
}


</style>