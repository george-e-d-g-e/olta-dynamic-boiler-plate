// UTILS

export const utils = {
  prepareLocalDev,
  getSearchParams,
  queryfetcher
}

// helper function to change search params to what they will be on a minted nft
export function prepareLocalDev(id, address) {
  const expectedSearchParams = `?id=${id}&address=${address}`
  if ((location.href.includes("localhost") || location.href.includes("127.0.0.1")) && location.search != expectedSearchParams) {
    location.search = expectedSearchParams
  }
}

// Helps parse URL search params.
function getSearchParams(...params) {
  const url = new URL(self.location.href)

  return params.map(p => ({ [p]: url.searchParams.get(p) })).reduce((a, b) => ({ ...a, ...b }), {})
}

// queryfetcher and downloader can be replaced with graphql Libary of choice
// https://www.npmjs.com/package/graphql-request is a nice simple one

// Helps run data queries.
export async function queryfetcher(url, query, settings = {}) {
  const download = downloader(20000)
  const options = {
    body: JSON.stringify({ query }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "post",
    // Allow for overriding default options.
    ...settings,
  }

  try {
    const response = await download(url, options)

    response?.errors?.forEach((e) => {
      throw new Error(e.message)
    })

    return response?.data
  } catch (e) {
    throw e
  }
}

// Helps run HTTP requests.
export function downloader(timeout = 100 * 1000) {
  return async (url, options = {}) => {
    // Guard against unresponsive calls.
    const controller = new AbortController()

    const timer = setTimeout(() => {
      clearTimeout(timer)
      controller.abort()
    }, timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        ...options,
      })

      if (response.ok) {
        return await response.json()
      }

      throw new Error(`${response.status}: ${response.statusText || "Error"}.`)
    } catch (e) {
      // Forward to caller, JSON parsing errors end up here too.
      throw e
    }
  }
}