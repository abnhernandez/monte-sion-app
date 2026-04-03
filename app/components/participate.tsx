import { Clock, Video, FileEdit, Calendar, Users } from "lucide-react";

export function Participate() {
  const actions = [
    {
      icon: FileEdit,
      title: "Registra tu Peticion",
      description:
        "¿Podemos orar por tu peticion? Registrala para que todos los administradores puedan verla y orar por ella.",
      buttonText: "Registrar Peticion",
      href: "/peticion",
      primary: true,
    },
    {
      icon: Video,
      title: "Reuniones Diarias",
      description:
        "Nos reunimos todos los dias de 10 pm a 11 pm, hora de CDMX, para orar juntos.",
      buttonText: "Unirse a la llamada",
      href: "https://chat.whatsapp.com/Lm9bm3fK9PNGHcHNWkavMr",
      target: "_blank",
      rel: "noreferrer noopener",
      primary: false,
    },
    {
      icon: Calendar,
      title: "Calendario de Actividades",
      description:
        "Consulta el calendario completo con todas las actividades y eventos del grupo.",
      buttonText: "Ver Calendario",
      href: "https://calendar.google.com/calendar/u/0?cid=YmM1NzA3MWZiNzkyMzQ3ZWM0MGNiMjZhZWFkMjcwNDNmZjMwNTQxYjYzZDM1MjY4YTgwMGY5NDg4MTdmZjc1M0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t",
      target: "_blank",
      rel: "noreferrer noopener",
      primary: false,
    },
  ];
actions.push({
    icon: Users,
    title: "Comunidad de WhatsApp",
    description:
        "Únete a nuestra comunidad para compartir avisos, peticiones y acompañamiento.",
    buttonText: "Unirse a la comunidad",
    href: "https://chat.whatsapp.com/GC6PocIbE3L9a0YhvzWmWk",
    target: "_blank",
    rel: "noreferrer noopener",
    primary: false,
});

  return (
    <section id="participar" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            ¿Cómo Participar?
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Únete a nuestra comunidad de oración y estudio bíblico
          </p>
        </div>

        {/* Schedule highlight */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 mb-12 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center text-center sm:text-left">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
            Horario de Reuniones
              </p>
              <p className="text-2xl font-bold text-foreground">
            <time dateTime="22:00">10:00 p. m.</time> –{" "}
            <time dateTime="23:00">11:00 p. m.</time>
              </p>
              <p className="text-sm italic text-muted-foreground">
            Hora Ciudad de México (GMT-6)
              </p>
              <p className="text-sm text-muted-foreground">Lunes a Viernes</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex flex-col p-8 bg-card rounded-2xl border border-border hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <action.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {action.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                {action.description}
              </p>
              <a
                href={action.href}
                target={action.target}
                rel={action.rel}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
                  action.primary
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {action.buttonText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}