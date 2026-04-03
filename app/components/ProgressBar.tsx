"use client"
type ProgressBarProps = { label: string; percent: number }

export default function ProgressBar({ label, percent }: ProgressBarProps) {
  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full">
        <div className="h-3 bg-emerald-400 rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}