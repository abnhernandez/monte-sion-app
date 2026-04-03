'use client'

import React, { useMemo, useRef, useState } from "react";
import { Check, Folder, ChevronRight } from "lucide-react";

type Clase = {
  id: string;
  titulo: string;
  visto?: boolean;
  tipo?: "Clase" | "Evaluación" | "Recurso";
};

type Seccion = {
  id: string;
  titulo: string;
  clases?: Clase[];
  semanas?: Semana[];
  defaultOpen?: boolean;
};

type Semana = {
  id: string;
  titulo: string;
  clases: Clase[];
};

const ChevronIcon: React.FC<{ size?: number; color?: string; open?: boolean }> = ({ size = 18, color = "#374151", open }) => (
  <ChevronRight
    size={size}
    color={color}
    style={{ transform: `rotate(${open ? 90 : 0}deg)`, transition: "transform 0.2s ease" }}
    aria-hidden
  />
);

const data: Seccion[] = [
  {
    id: "tutoriales",
    titulo: "Tutoriales Unibetas",
    defaultOpen: true,
    clases: [
      { id: "c1", titulo: "¿Cómo navegar y acceder a las clases?", visto: true, tipo: "Recurso" },
      { id: "c2", titulo: "Contenido extra y clases pasadas", visto: true, tipo: "Recurso" },
      { id: "c3", titulo: "¿Cómo puedo descargar los apuntes de las clases?", visto: false, tipo: "Recurso" },
      { id: "c4", titulo: "¿Dónde puedo resolver exámenes simuladores?", visto: true, tipo: "Evaluación" },
      { id: "c5", titulo: "¿Cómo acceder al calendario de clases?", visto: true, tipo: "Recurso" },
      { id: "c6", titulo: "Soporte técnico", visto: true, tipo: "Recurso" },
    ],
  },
  {
    id: "semanas",
    titulo: "Semanas",
    semanas: [
      {
        id: "sem0",
        titulo: "Semana #0 - Inducción / 10 al 14 de noviembre",
        clases: [
          { id: "s0c1", titulo: "Bienvenida e inducción", visto: false, tipo: "Clase" },
          { id: "s0c2", titulo: "Herramientas y plataforma", visto: false, tipo: "Clase" },
        ],
      },
      {
        id: "sem1",
        titulo: "Semana #1 / 18 al 21 de noviembre",
        clases: [
          { id: "s1c1", titulo: "Clase 1", visto: false, tipo: "Clase" },
          { id: "s1c2", titulo: "Clase 2", visto: false, tipo: "Clase" },
        ],
      },
      {
        id: "sem2",
        titulo: "Semana #2 / 24 al 28 de noviembre",
        clases: [
          { id: "s2c1", titulo: "Clase 1", visto: false, tipo: "Clase" },
          { id: "s2c2", titulo: "Clase 2", visto: false, tipo: "Clase" },
        ],
      },
    ],
  },
];

const StatusDot: React.FC<{ visto?: boolean; active?: boolean }> = ({ visto, active }) => {
  const borderColor = "#16a34a"; // green-600
  const fillColor = visto ? "#16a34a" : "transparent";
  return (
    <span
      style={{
        position: "relative",
        width: 16,
        height: 16,
        borderRadius: "50%",
        border: `2px solid ${borderColor}`,
        background: fillColor,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
      aria-hidden
    >
      {visto && (
        <Check
          size={12}
          color={active ? "#e8f5e9" : "#ffffff"}
          style={{ position: "absolute" }}
          aria-hidden
        />
      )}
    </span>
  );
};

const SectionHeader: React.FC<{
  title: string;
  open: boolean;
  onToggle: () => void;
  inset?: boolean;
}> = ({ title, open, onToggle, inset }) => (
  <button
    onClick={onToggle}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      width: "100%",
      background: "transparent",
      border: "none",
      padding: inset ? "10px 12px" : "12px 16px",
      cursor: "pointer",
      color: "#111827",
      fontWeight: 600,
      borderRadius: inset ? 12 : 16,
    }}
    aria-expanded={open}
  >
    <ChevronIcon open={open} />
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Folder size={18} color="#6b7280" aria-hidden />
      {title}
    </span>
  </button>
);

const ClaseItem: React.FC<{
  clase: Clase;
  active?: boolean;
  onClick?: () => void;
  visto?: boolean;
}> = ({ clase, active, onClick, visto }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 12,
      background: active ? "#1e40af" : "transparent",
      color: active ? "#ffffff" : "#111827",
      cursor: "pointer",
    }}
  >
    <StatusDot visto={visto ?? clase.visto} active={!!active} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div>{clase.titulo}</div>
      <small style={{ color: active ? "#bfdbfe" : "#6b7280" }}>
        {clase.tipo ?? "Clase"}
      </small>
    </div>
  </div>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: 20,
      overflow: "hidden",
      ...style,
    }}
  >
    {children}
  </div>
);

const Divider: React.FC = () => <div style={{ height: 1, background: "#e5e7eb" }} />;

const Temario: React.FC = () => {
  const defaultOpenSections = useMemo(
    () => Object.fromEntries(data.map(s => [s.id, true])),
    []
  );
  const defaultOpenSemanas = useMemo(() => {
    const semanas = data.find(s => s.semanas)?.semanas ?? [];
    return Object.fromEntries(semanas.map(sem => [sem.id, true]));
  }, []);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(defaultOpenSections);
  const [openSemana, setOpenSemana] = useState<Record<string, boolean>>(defaultOpenSemanas);

  // Track vistos by clase id (so we can mark as visto on click)
  const initialVistos = useMemo(() => {
    const all: Record<string, boolean> = {};
    data.forEach(s => {
      s.clases?.forEach(c => { all[c.id] = !!c.visto; });
      s.semanas?.forEach(sem => sem.clases.forEach(c => { all[c.id] = !!c.visto; }));
    });
    return all;
  }, []);
  const [vistos, setVistos] = useState<Record<string, boolean>>(initialVistos);

  const firstClaseId = useMemo(() => {
    const tutorialFirst = data[0]?.clases?.[0]?.id;
    if (tutorialFirst) return tutorialFirst;
    const semanas = data.find(s => s.semanas)?.semanas ?? [];
    return semanas[0]?.clases?.[0]?.id ?? "";
  }, []);
  const [activeClaseId, setActiveClaseId] = useState<string>(firstClaseId);

  // ref para hacer scroll a la primera clase
  const firstClaseRef = useRef<HTMLDivElement | null>(null);

  const toggleSection = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleSemana = (id: string) =>
    setOpenSemana(prev => ({ ...prev, [id]: !prev[id] }));

  const handleClaseClick = (id: string) => {
    setActiveClaseId(id);
    setVistos(prev => ({ ...prev, [id]: true }));
  };

  const clearAll = () => {
    // limpiar vistos
    setVistos(prev => {
      const cleared: Record<string, boolean> = {};
      Object.keys(prev).forEach(k => { cleared[k] = false; });
      return cleared;
    });

    // abrir solo la primera sección y cerrar las demás
    setOpenSections({
      [data[0].id]: true,
      ...(data[1] ? { [data[1].id]: false } : {}),
    });

    // cerrar todas las semanas
    const semanas = data[1]?.semanas ?? [];
    const allClosedSemanas = Object.fromEntries(semanas.map(s => [s.id, false]));
    setOpenSemana(allClosedSemanas);

    // volver a la primera clase y hacer scroll
    setActiveClaseId(firstClaseId);
    // pequeño timeout para asegurar que el DOM actualizó antes del scroll
    setTimeout(() => {
      firstClaseRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 0);
  };

  return (
    <aside
      aria-label="Temario del curso"
      style={{
        width: 360,
        minWidth: 280,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .temarioScroll {
          max-height: 80vh;
          overflow: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .temarioScroll::-webkit-scrollbar { display: none; }
        .linkReset {
          color: #6b7280; /* gray-500 */
          text-decoration: none; /* sin subrayado */
          cursor: pointer;
          padding: 8px 12px; /* más pequeño */
          display: inline-block;
          font-size: 12px; /* más pequeño */
        }
        .linkRow {
          display: flex;
          justify-content: flex-end; /* a la derecha */
        }
      `}</style>

      <Card style={{ marginTop: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            background: "#f9fafb",
            color: "#111827",
            fontWeight: 700,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Folder size={18} color="#6b7280" aria-hidden />
          Temario del curso
        </div>

        <div className="temarioScroll" style={{ padding: 12 }}>
          <SectionHeader
            title={data[0].titulo}
            open={!!openSections[data[0].id]}
            onToggle={() => toggleSection(data[0].id)}
            inset
          />
          {openSections[data[0].id] && (
            <div style={{ padding: "6px 8px 10px 8px" }}>
              {data[0].clases?.map((c, idx) => (
                <div
                  key={c.id}
                  ref={idx === 0 ? firstClaseRef : null}
                >
                  <ClaseItem
                    clase={c}
                    visto={vistos[c.id]}
                    active={activeClaseId === c.id}
                    onClick={() => handleClaseClick(c.id)}
                  />
                </div>
              ))}
            </div>
          )}
          <Divider />

          <SectionHeader
            title="Semanas"
            open={!!openSections[data[1].id]}
            onToggle={() => toggleSection(data[1].id)}
          />
          {openSections[data[1].id] && (
            <div>
              {data[1].semanas?.map(sem => (
                <div key={sem.id}>
                  <button
                    onClick={() => toggleSemana(sem.id)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "12px 16px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#111827",
                      fontWeight: 600,
                      borderRadius: 16,
                    }}
                  >
                    <ChevronIcon open={!!openSemana[sem.id]} />
                    <Folder size={18} color="#6b7280" aria-hidden />
                    <span>{sem.titulo}</span>
                  </button>
                  {openSemana[sem.id] && (
                    <div style={{ padding: "6px 12px 12px 32px" }}>
                      {sem.clases.map(c => (
                        <ClaseItem
                          key={c.id}
                          clase={c}
                          visto={vistos[c.id]}
                          active={activeClaseId === c.id}
                          onClick={() => handleClaseClick(c.id)}
                        />
                      ))}
                    </div>
                  )}
                  <Divider />
                </div>
              ))}
            </div>
          )}

          <div className="linkRow">
            <a className="linkReset" onClick={clearAll}>
              Limpiar clases y volver a la primera
            </a>
          </div>
        </div>
      </Card>
    </aside>
  );
};

export default Temario;