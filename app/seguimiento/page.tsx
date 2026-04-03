"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { guardarUbicacionUsuario } from "@/lib/rutas-actions"

const MIN_SAVE_INTERVAL_MS = 15000
const MIN_DISTANCE_TO_SAVE_METERS = 15

type PositionSnapshot = {
	lat: number
	lng: number
	accuracy: number
	updatedAt: number
}

function toRadians(value: number) {
	return (value * Math.PI) / 180
}

function getDistanceMeters(
	from: Pick<PositionSnapshot, "lat" | "lng">,
	to: Pick<PositionSnapshot, "lat" | "lng">,
) {
	const earthRadiusMeters = 6371000
	const deltaLat = toRadians(to.lat - from.lat)
	const deltaLng = toRadians(to.lng - from.lng)
	const lat1 = toRadians(from.lat)
	const lat2 = toRadians(to.lat)

	const haversine =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

	const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
	return earthRadiusMeters * arc
}

function formatGeolocationError(error: GeolocationPositionError | Error) {
	if (error instanceof GeolocationPositionError) {
		switch (error.code) {
			case error.PERMISSION_DENIED:
				return "Debes permitir el acceso a ubicación para activar el seguimiento."
			case error.POSITION_UNAVAILABLE:
				return "La posición no está disponible en este momento."
			case error.TIMEOUT:
				return "Se agotó el tiempo al obtener tu ubicación."
			default:
				return "No se pudo iniciar el seguimiento de ubicación."
		}
	}

	return error.message || "No se pudo iniciar el seguimiento de ubicación."
}

export default function SeguimientoPage() {
	const [isWatching, setIsWatching] = useState(false)
	const [position, setPosition] = useState<PositionSnapshot | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)

	const watchIdRef = useRef<number | null>(null)
	const lastSavedRef = useRef<PositionSnapshot | null>(null)
	const savingRef = useRef(false)

	const stopWatch = useCallback(() => {
		if (watchIdRef.current !== null) {
			navigator.geolocation.clearWatch(watchIdRef.current)
			watchIdRef.current = null
		}
		setIsWatching(false)
	}, [])

	const maybeSavePosition = useCallback(async (snapshot: PositionSnapshot) => {
		if (savingRef.current) {
			return
		}

		const previous = lastSavedRef.current
		const elapsed = previous ? snapshot.updatedAt - previous.updatedAt : Number.POSITIVE_INFINITY
		const moved = previous
			? getDistanceMeters(
					{ lat: previous.lat, lng: previous.lng },
					{ lat: snapshot.lat, lng: snapshot.lng },
				)
			: Number.POSITIVE_INFINITY

		const shouldSave =
			!previous || elapsed >= MIN_SAVE_INTERVAL_MS || moved >= MIN_DISTANCE_TO_SAVE_METERS

		if (!shouldSave) {
			return
		}

		try {
			savingRef.current = true
			await guardarUbicacionUsuario({
				userLat: snapshot.lat,
				userLng: snapshot.lng,
			})
			lastSavedRef.current = snapshot
			setLastSavedAt(snapshot.updatedAt)
		} catch (saveError) {
			const message = saveError instanceof Error ? saveError.message : "No se pudo guardar ubicación"
			setError(message)
		} finally {
			savingRef.current = false
		}
	}, [])

	const startWatch = useCallback(() => {
		if (!navigator.geolocation) {
			setError("Tu navegador no soporta geolocalización")
			return
		}

		if (watchIdRef.current !== null) {
			return
		}

		setError(null)

		watchIdRef.current = navigator.geolocation.watchPosition(
			(geoPosition) => {
				const snapshot: PositionSnapshot = {
					lat: geoPosition.coords.latitude,
					lng: geoPosition.coords.longitude,
					accuracy: geoPosition.coords.accuracy,
					updatedAt: Date.now(),
				}

				setPosition(snapshot)
				setIsWatching(true)
				void maybeSavePosition(snapshot)
			},
			(geoError) => {
				setIsWatching(false)
				setError(formatGeolocationError(geoError))
			},
			{
				enableHighAccuracy: true,
				timeout: 15000,
				maximumAge: 0,
			},
		)
	}, [maybeSavePosition])

	const mapUrl = position
		? `https://maps.google.com/maps?q=${position.lat},${position.lng}&z=16&output=embed`
		: null

	useEffect(() => {
		startWatch()

		return () => {
			stopWatch()
		}
	}, [startWatch, stopWatch])

	return (
		<main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-2xl items-center px-4 py-10">
			<section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-slate-900">Seguimiento en tiempo real</h1>
				<p className="mt-2 text-sm text-slate-600">
					El seguimiento permanece activo mientras esta pagina este abierta.
				</p>

				<div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
					<p>
						Estado: <span className="font-semibold">{isWatching ? "Activo" : "Inactivo"}</span>
					</p>
					<p>
						Latitud: <span className="font-mono">{position?.lat ?? "-"}</span>
					</p>
					<p>
						Longitud: <span className="font-mono">{position?.lng ?? "-"}</span>
					</p>
					<p>
						Precision: <span className="font-mono">{position ? `${Math.round(position.accuracy)} m` : "-"}</span>
					</p>
					<p>
						Ultimo guardado: <span className="font-mono">{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : "-"}</span>
					</p>
				</div>

				{error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

				{mapUrl ? (
					<div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
						<iframe
							title="Mapa de seguimiento"
							src={mapUrl}
							className="h-72 w-full"
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
						/>
					</div>
				) : (
					<p className="mt-6 text-sm text-slate-600">
						Esperando la primera ubicacion para cargar el mapa en vivo.
					</p>
				)}

				{!isWatching ? (
					<div className="mt-6">
						<button
							type="button"
							onClick={startWatch}
							className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
						>
							Reintentar seguimiento
						</button>
					</div>
				) : null}
			</section>
		</main>
	)
}
