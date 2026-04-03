import "@testing-library/jest-dom"
import { TextDecoder, TextEncoder } from "util"
import {
	ReadableStream,
	TransformStream,
	WritableStream,
} from "node:stream/web"
import { MessageChannel, MessagePort } from "node:worker_threads"

function defineGlobalIfMissing(name: string, value: unknown) {
	if (typeof Reflect.get(globalThis, name) === "undefined") {
		Object.defineProperty(globalThis, name, {
			value,
			configurable: true,
			writable: true,
		})
	}
}

defineGlobalIfMissing("TextEncoder", TextEncoder)
defineGlobalIfMissing("TextDecoder", TextDecoder)
defineGlobalIfMissing("ReadableStream", ReadableStream)
defineGlobalIfMissing("TransformStream", TransformStream)
defineGlobalIfMissing("WritableStream", WritableStream)
defineGlobalIfMissing("MessagePort", MessagePort)
defineGlobalIfMissing("MessageChannel", MessageChannel)

if (typeof fetch === "undefined") {
	defineGlobalIfMissing("fetch", async () => ({
		ok: true,
		status: 200,
		json: async () => ({}),
	}))
}