<script>

</script>

<template>
  <div class="center-box">
    <div class="lobby-box">
      Lobbies
    </div>
    <div class="login-box">
      Login
      <div>
        Sign-in information
        <input />
        <input />
        <button>Submit</button>
      </div>
      <div>
        Login Status: X
      </div>
      <div>
        <button>Logout</button>
      </div>
    </div>
  </div>
</template>

<style>

.center-box {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}

.lobby-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

.login-box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
}

</style>