'use client'

import { useEffect, useState, useTransition } from 'react'
import { listStorageFiles, getPublicFileUrl } from '@/lib/storage-actions'
import { FileText, FolderOpen } from 'lucide-react'

type Props = {
    bucket: string
    prefix?: string // opcional: subcarpeta dentro del bucket
}

export default function Material({ bucket, prefix = '' }: Props) {
    const [files, setFiles] = useState<{ name: string; id?: string; updated_at?: string; publicUrl?: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [, startTransition] = useTransition()

    useEffect(() => {
        startTransition(async () => {
            setLoading(true)
            setError(null)

            try {
                const data = await listStorageFiles(bucket, prefix)
                
                // Obtener URLs públicas para cada archivo
                const filesWithUrls = await Promise.all(
                    data.map(async (f) => ({
                        ...f,
                        publicUrl: await getPublicFileUrl(bucket, prefix ? `${prefix}/${f.name}` : f.name),
                    }))
                )
                
                setFiles(filesWithUrls)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error desconocido')
                setFiles([])
            } finally {
                setLoading(false)
            }
        })
    }, [bucket, prefix])

    const uploadedFilesCount = files.length

    return (
        <section className="w-full py-6">
            {/* Pestaña de sección */}
            <div className="flex items-center gap-2 px-2">
                <FileText className="text-blue-500" size={18} />
                <span className="text-sm font-bold text-foregroud-700">Material</span>
                <span className="ml-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-bold text-blue-600">
                    {uploadedFilesCount}
                </span>
            </div>

            {/* Separador: azul bajo el icono + "Material", gris el resto */}
            <div className="mt-2 flex w-full items-center">
                <div className="h-px bg-blue-500 w-[130px] sm:w-[160px]" />
                <div className="h-px flex-1 bg-gray-800" />
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-7 py-10">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                        <FolderOpen size={28} />
                    </div>
                    <p className="text-sm text-gray-700">Cargando...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center text-center text-red-600 py-10">
                    <p className="text-sm font-semibold">Error al cargar: {error}</p>
                </div>
            ) : uploadedFilesCount === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-gray-7 py-10">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                        <FolderOpen size={28} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700">Aún no hay material disponible</h3>
                    <p className="mt-1 text-xs text-gray-500">
                        Cuando se agreguen archivos, aparecerán aquí
                    </p>
                </div>
            ) : (
                <ul className="mt-4 grid gap-2 px-2">
                    {files.map((f) => (
                        <li key={f.name} className="flex items-center justify-between rounded border border-gray-200 p-2">
                            <div className="flex items-center gap-2">
                                <FileText className="text-gray-600" size={16} />
                                <span className="text-sm text-gray-800">{f.name}</span>
                            </div>
                            <a
                                className="text-xs text-blue-600 hover:underline"
                                href={f.publicUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Ver
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

/*
Instrucciones:
1) Añade en .env.local:
     NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
     NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"

2) Crea un bucket en Supabase Storage y marca "public" si deseas usar getPublicUrl.

3) Usa el componente:
     <Material bucket="mi-bucket" />
     // o con subcarpeta:
     <Material bucket="mi-bucket" prefix="cursos/abc" />
*/
