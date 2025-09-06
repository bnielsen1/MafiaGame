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
    if (res.status === 403) {
      try {
        accessToken = await store.dispatch("refresh")
        options.headers.Authorization = `Bearer ${accessToken}`
        res = await fetch(url, options) // try again with new accessToken
      } catch (err) {
        store.dispatch("logout")
      }
    }

    return res;
}

export default authFetch