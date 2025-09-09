# Game Structure

- Day/night phases
- Timer for each phase
- Roles[] (*Means priority)
    - *Villager
    - *Doctor (repeated saves) (no self)
    - Medic (no repeat saves) (no self)
    - *Cop
    - *Mafia
    - Hooker
    - Godfather
    - Mason
- Settings
    - Round end settings
        - Majority ends voting OR All votes ends voting
        - No select = random vote
    - Voting settings
        - Majority voted dies OR highest votes dies
        - Tie == random select OR nobody dies
    - Day and night time lengths
    - Game start settings
        - Night (normal all actions)
        - Night (no kill night 1)
        - Day (uninformed)
        - Day (informed)
    - Role Reveal on death
        - Full reveals
        - Allignment reveals
        - No reveals

# Gamestate

### Structure

- Player[]
    - Username: string
    - Color: string
    - Alive: bool
    - Role: string

- Phase[]
  - Day/Night: bool
  - Count: int
  - Chat[] (variable amount of chats)
    - Users[] (users to be displayed in the voting section)
      - User: string
      - Target: string
    - Message[]
      - User: string
      - Time: date/time
      - Message: string

- Timer: int

- LobbyStatus: enum -> (LOBBY, INGAME, POSTGAME)

### Local State Differences

Players:
- Dont send acion choice unless display needed
- Dont send vote target in night phase unless user is mafia aligned
- Role data always sent but is null if player should be revealed
- Any role data should be auto revealed by client (so mafia can see who each other are)
- Users only receive one chat object

Phase:
- Permission enum is not sent. It determines if a message should be sent to the user at all

Everything else is good and should be stored just as written on the client

# Packets

Packets are sorted into two categories S2C and C2S.

S2C packets can either be broadcasted or sent to individual clients. This is determined by a 
factor not included in the packet structure.

Both S2C and C2S packets are classes but get transmitted in JSON. Both packet types always include
a "type" field that the client or server can use to determine what the rest of the packet might contain.
a server_id field is included in c2s packets so the game lobby can be determined

### C2S Packets

sendMessage {
    user: string
    time: date/time
    message: string
}

sendVote {
    user: string
    target: string
    time: date/time
}

startGame {
    user: string
}

readyChange {
    user: string
    ready: bool
}

### S2C Packets

newMessage {
    user: string
    time: date/time
    message: string
}

newVote {
    user: string
    target: string
    time: date/time
}

gameStart {
    gameStage: gamestate (see above for how this will be formatted)
}

timeUpdate {
    time: int
}

phaseEnd {
    phase: new phase data
      - same data as stored on server except one chat is sent
      - send the chat only the user is contained in
      - the chat with no users is sent to all spectators
    players:
      - send player list hiding and showing things according to what that user should see!
}

gameEnd {
    gameState: send the same gamestate to everyone
    victory: bool -> victory or defeat depending on their role
}