'use client'

import { useEffect, useState, useMemo, useTransition } from 'react'
import { getVersiculos, type Versiculo } from '@/lib/bible-actions'
import confetti from 'canvas-confetti'

export default function VersiculosPage(){

const [versiculos,setVersiculos] = useState<Versiculo[]>([])
const [loading,setLoading] = useState(true)

const [modoJuego,setModoJuego] = useState(false)
const [nivel,setNivel] = useState(1)

const [copiado,setCopiado] = useState(false)

const [respuestas,setRespuestas] = useState<string[]>([])
const [, startTransition] = useTransition()

useEffect(()=>{

startTransition(async () => {
  const data = await getVersiculos()
  setVersiculos(data)
  setLoading(false)
})

},[])

const versiculoActual = versiculos[versiculos.length-1]

const palabras = useMemo(()=>{

if(!versiculoActual) return []

return versiculoActual.texto.split(' ')

},[versiculoActual])

// cantidad de palabras ocultas segun nivel

const ocultas = useMemo(()=>{

if(!modoJuego) return []

const cantidad = Math.floor(palabras.length * (nivel*0.15))

if (cantidad <= 0 || palabras.length === 0) return []

const indexes:number[]=[]
const step = Math.max(1, Math.floor(palabras.length / cantidad))
let cursor = (nivel * 3) % palabras.length

while(indexes.length < cantidad){
	if(!indexes.includes(cursor)){
		indexes.push(cursor)
	}
	cursor = (cursor + step) % palabras.length
}

return indexes.sort((a,b)=>a-b)

},[palabras,nivel,modoJuego])

useEffect(()=>{

setRespuestas(Array(ocultas.length).fill(''))

},[ocultas])

// verificar si completo

const completo = useMemo(()=>{

if(!modoJuego) return false

return ocultas.every((index,i)=>
respuestas[i]?.toLowerCase() === palabras[index].toLowerCase()
)

},[respuestas,ocultas,palabras,modoJuego])

useEffect(()=>{

if(completo){

confetti({
particleCount:120,
spread:70,
origin:{y:0.6}
})

}

},[completo])

const copiar = async ()=>{

if(!versiculoActual) return

await navigator.clipboard.writeText(versiculoActual.texto)

setCopiado(true)

setTimeout(()=>{
setCopiado(false)
},2000)

}

if(loading) return(
<div className="p-8 text-neutral-400">
Cargando...
</div>
)

return(

<div className="p-4 sm:p-6 lg:p-8">

<div className="mx-auto w-full max-w-5xl space-y-8">

{/* HEADER */}

<div>

<h1 className="text-2xl sm:text-3xl font-bold">
Versículos para memorizar
</h1>

<p className="text-sm text-neutral-500">
“En mi corazón he guardado tus dichos
para no pecar contra ti.” — Salmo 119:11
</p>

</div>

{/* CARD PRINCIPAL */}

{versiculoActual &&(

<section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-8">

<p className="text-sm text-neutral-500 mb-4">
📖 Versículo de la semana
</p>

<p className="text-xl md:text-2xl leading-9 text-neutral-200 font-medium">

{palabras.map((palabra,i)=>{

const ocultoIndex = ocultas.indexOf(i)

if(ocultoIndex !== -1){

return(

<input
key={i}
value={respuestas[ocultoIndex] || ''}
onChange={(e)=>{

const r=[...respuestas]
r[ocultoIndex]=e.target.value
setRespuestas(r)

}}
className="
mx-1
px-2
py-1
rounded
bg-neutral-800
text-white
border
border-neutral-600
w-24
text-center
"
/>

)

}

return(
<span key={i} className="mr-1">
{palabra}
</span>
)

})}

</p>

<p className="mt-6 font-semibold text-neutral-300">

{versiculoActual.libro} {versiculoActual.capitulo}:{versiculoActual.versiculo}

</p>

<div className="flex gap-3 mt-6 flex-wrap">

<button
onClick={()=>setModoJuego(!modoJuego)}
className="
px-4 py-2
text-sm
rounded-lg
border
border-neutral-700
hover:bg-neutral-900
transition
"
>

{modoJuego ? 'Salir del modo juego' : 'Modo memorizar'}

</button>

<button
onClick={()=>setNivel(nivel+1)}
className="
px-4 py-2
text-sm
rounded-lg
border
border-neutral-700
hover:bg-neutral-900
transition
"
>

Subir dificultad
</button>

<button
onClick={copiar}
className="
px-4 py-2
text-sm
rounded-lg
border
border-neutral-700
hover:bg-neutral-900
transition
"
>

{copiado ? "✓ Copiado" : "Copiar"}

</button>

</div>

{completo &&(

<div className="mt-6 text-green-400 font-semibold">
🎉 ¡Versículo completado!
</div>

)}

</section>

)}

{/* HISTORIAL */}

<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

{versiculos.map((v,i)=>{

const actual = i===versiculos.length-1

return(

<div
key={v.id}
className="
rounded-xl
border
border-neutral-200
dark:border-neutral-800
bg-white
dark:bg-neutral-950
p-5
space-y-3
"
>

<p className="text-xs text-neutral-500">
Semana {i+1} {actual && 'Actual'}
</p>

<p className="text-sm font-medium">
{v.libro} {v.capitulo}:{v.versiculo}
</p>

<p className="text-sm text-neutral-400 leading-relaxed">
{v.texto}
</p>

</div>

)

})}

</section>

</div>

</div>

)

}
