import store from "@/store"

async function authFetch(url, options = {}) {
    let accessToken = store.state.accessToken

    // add token to the users passed options
    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${accessToken}`
    },
    options.credentials = "include"

    let res = await fetch(url, options)

    // if we fail to get a response, try refreshing our access token
    if (!res.ok) {
      try {
        // console.log("Trying to refresh token!!!")
        await store.dispatch("refresh")
        accessToken = store.state.accessToken
        options.headers.Authorization = `Bearer ${accessToken}`
        let new_res = await fetch(url, options) // try again with new accessToken
        if (!new_res.ok) {
          console.log("Refresh was okay but still couldn't call authenticated route")
          throw new Error("Refresh was okay but still couldn't call authenticated route")
        } else {
          console.log("Logged in")
          return new_res
        }
      } catch (err) {
        // console.error("failed to refresh... logging out...", err)
        store.dispatch("logout")
      }
    }

    return res;
}

export default authFetch