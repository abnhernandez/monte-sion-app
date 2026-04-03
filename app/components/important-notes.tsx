import { AlertCircle, Clock, BookMarked, Heart } from "lucide-react";

export function ImportantNotes() {
  const notes = [
    {
      icon: Heart,
      text: "Las peticiones de oracion se registran en el enlace, para que todos los administradores puedan verlas y orar por ellas.",
    },
    {
      icon: Clock,
      text: "Las reuniones diarias son de 10 pm a 11 pm CDMX, para mantener un horario fijo y dinámico.",
    },
    {
      icon: BookMarked,
      text: "El plan de lectura se organiza por día, no todo de golpe, para que cada miembro pueda seguirlo sin saturarse.",
    },
    {
      icon: AlertCircle,
      text: "Se fomenta la constancia en la oración y el estudio bíblico diario.",
    },
  ];

  return (
    <section className="py-24 bg-card">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Notas Importantes
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="space-y-4">
          {notes.map((note, index) => (
            <div
              key={index}
              className="flex gap-4 p-6 bg-background rounded-xl border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <note.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-foreground leading-relaxed pt-1.5">
                {note.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}