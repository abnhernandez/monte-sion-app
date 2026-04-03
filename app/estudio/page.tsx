import { getBiblePassage } from "@/lib/bible-actions"

export default async function BiblePage() {

  const data = await getBiblePassage({
    passage: "romans 12"
  })

  return (
    <div className="space-y-4">

      <h1 className="text-xl font-bold">
        Biblia
      </h1>

      <div className="border rounded-lg p-4 leading-relaxed">

        <strong>{data.reference}</strong>

        <p className="mt-2 whitespace-pre-line">
          {data.text}
        </p>

      </div>

    </div>
  )
}