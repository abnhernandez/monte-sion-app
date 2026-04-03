declare module "swr" {
	type Key = string | null | false | (() => string | null | false)

	type SWRResponse<Data = unknown, Error = unknown> = {
		data?: Data
		error?: Error
		isLoading?: boolean
	}

	const useSWR: <Data = unknown, Error = unknown>(
		key: Key,
		fetcher?: (key: string) => Promise<Data>,
		config?: unknown
	) => SWRResponse<Data, Error>

	export default useSWR
}
