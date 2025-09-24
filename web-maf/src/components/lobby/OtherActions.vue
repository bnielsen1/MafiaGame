<script>
import { Column, DataTable, Accordion, AccordionPanel, AccordionHeader, AccordionContent } from 'primevue';


export default {
  components: {
    DataTable,
    Column,
    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent
  },
  props: {
    unstructuredPlayers: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      openSections: new Array(),
      actionTypes: []
    }
  },
  watch: {
    unstructuredPlayers: {
      handler(newPlayers) {
        this.restructurePlayers(newPlayers);
      },
      immediate: true // update on component creation
    }
  },
  methods: {
    toggleAction(id) {
      if (!this.openSections.find((dropdown) => dropdown === id)) {
        this.openSections.push(id)
      } else {
        this.openSections = this.openSections.filter((dropdown) => dropdown !== id)
      }
    },
    isOpen(id) {
      if (this.openSections.find((dropdown) => dropdown === id)) {
        return true
      } else {
        return false
      }
    },
    restructurePlayers(oldPlayers) {
      const foundActions = new Map();
      oldPlayers.forEach((player) => {
        const playersActions = player.role.actions;
        playersActions.forEach((action) => {
          if (foundActions.has(action.title)) {
            const oldAction = foundActions.get(action.title)
            const newActor = {
              name: player.username,
              target: action.target
            }
            oldAction.actors.push(newActor)
          }
          else {
            const newAction = {
              title: action.title,
              actors: [
                {
                  name: player.username,
                  target: action.target
                }
              ]
            }
            foundActions.set(action.title, newAction)
          }
        })
      })

      this.actionTypes = Array.from(foundActions.values())
    }
  },
  created() {
    if (this.actionTypes.length !== 0) {
      this.openSections.push(this.actionTypes[0].title)
    }
  },
}

</script>


<template>
<div>
  <div class="public-actions">
    <div v-for="action in actionTypes">
      <button
        class="action-header"
        :class="{ 'active-header': isOpen(action.title) }"
        @click="toggleAction(action.title)"
      >
        {{ action.title }}
      </button>
      <div
        class="table-wrapper"
        :style="{ 
          height: isOpen(action.title) ? ((action.actors.length + 1) * 30) + 'px' : 0
        }"
      >
        <table class="action-table">
          <tr>
            <th class="table-left">VOTER</th>
            <th class="table-right">TARGET</th>
          </tr>
          <tr v-for="actor in action.actors">
            <td class="table-left">{{ actor.name }}</td>
            <td class="table-right">{{ actor.target }}</td>
          </tr>
        </table>
      </div>
      
    </div>

  </div>
</div>
</template>


<style scoped>

.public-actions {
  font-size: 14px;
  color: white;
}

/* CSS for button */
.action-header {
  all: unset;

  background-color: var(--background-2);
  width: 292px;
  height: 22px;
  padding: 4px;
  margin: 0px;
  text-transform: capitalize;
  font-weight: 400;

  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* CSS for button of active action */
.action-header.active-header {
  background-color: var(--background-3);
}

.action-table {
  margin: 0px;
  border-collapse: collapse;
  width: 300px;
  min-height: 0px;
  overflow: hidden;
}

.table-wrapper {
  height: 0px;
  transition: height 0.5s ease-in-out;
  overflow: hidden;
}

.table-wrapper.expanded {
  height: auto;
  height: calc-size(auto);
}

.table-left {
  border-right: 1px solid var(--background-4);
}

.table-right {
  border-left: 1px solid var(--background-4);
}

tr {
  height: 30px;
}

td, th {
  background-color: var(--background-1);
  padding: 4px;
  margin: 0px;
  border-top: 1px solid var(--background-4);;
}

</style>