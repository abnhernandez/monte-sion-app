"use client";

import { useEffect, useRef, useState } from "react";

type BirthDateInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function parseBirthDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return { day: "", month: "", year: "" };
  }

  return {
    year: match[1],
    month: match[2],
    day: match[3],
  };
}

function isValidDate(year: string, month: string, day: string) {
  if (year.length !== 4 || month.length !== 2 || day.length !== 2) {
    return false;
  }

  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  const date = new Date(`${year}-${month}-${day}T12:00:00`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === parsedYear &&
    date.getUTCMonth() + 1 === parsedMonth &&
    date.getUTCDate() === parsedDay
  );
}

export default function BirthDateInput({ value, onChange }: BirthDateInputProps) {
  const [parts, setParts] = useState(() => parseBirthDate(value));
  const monthRef = useRef<HTMLInputElement | null>(null);
  const yearRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setParts(parseBirthDate(value));
  }, [value]);

  function commit(nextParts: { day: string; month: string; year: string }) {
    setParts(nextParts);

    if (isValidDate(nextParts.year, nextParts.month, nextParts.day)) {
      onChange(`${nextParts.year}-${nextParts.month}-${nextParts.day}`);
      return;
    }

    onChange("");
  }

  function handleDigitChange(
    field: "day" | "month" | "year",
    nextValue: string,
  ) {
    const digits = nextValue.replace(/\D/g, "");
    const maxLength = field === "year" ? 4 : 2;
    const trimmed = digits.slice(0, maxLength);
    const nextParts = { ...parts, [field]: trimmed };

    commit(nextParts);

    if (field === "day" && trimmed.length === 2) {
      monthRef.current?.focus();
    }

    if (field === "month" && trimmed.length === 2) {
      yearRef.current?.focus();
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <label className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Día
          </span>
          <input
            id="camp-birth-day"
            value={parts.day}
            onChange={(event) => handleDigitChange("day", event.target.value)}
            inputMode="numeric"
            placeholder="DD"
            maxLength={2}
            className="w-full rounded-2xl bg-background/80 px-4 py-3 text-sm text-foreground outline-none ring-1 ring-black/5 transition placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Mes
          </span>
          <input
            id="camp-birth-month"
            ref={monthRef}
            value={parts.month}
            onChange={(event) => handleDigitChange("month", event.target.value)}
            inputMode="numeric"
            placeholder="MM"
            maxLength={2}
            className="w-full rounded-2xl bg-background/80 px-4 py-3 text-sm text-foreground outline-none ring-1 ring-black/5 transition placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Año
          </span>
          <input
            id="camp-birth-year"
            ref={yearRef}
            value={parts.year}
            onChange={(event) => handleDigitChange("year", event.target.value)}
            inputMode="numeric"
            placeholder="AAAA"
            maxLength={4}
            className="w-full rounded-2xl bg-background/80 px-4 py-3 text-sm text-foreground outline-none ring-1 ring-black/5 transition placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        Escribe la fecha con números. Por ejemplo: 03 / 04 / 2008.
      </p>
    </div>
  );
}