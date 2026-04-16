'use server'

export async function getServerTime() {
  return new Date().toISOString()
}
