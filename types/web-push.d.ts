declare module "web-push" {
  export type RequestOptions = Record<string, unknown>

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void

  export function sendNotification(
    subscription: unknown,
    payload?: string | Buffer | null,
    options?: RequestOptions
  ): Promise<unknown>
}
