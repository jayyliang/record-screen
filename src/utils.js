export const setLocal = (key, value) => {
  window.localStorage.setItem(key, value)
}

export const getLocal = (key, defaultValue = null) => {
  const local = window.localStorage.getItem(key)
  return local || defaultValue
}
