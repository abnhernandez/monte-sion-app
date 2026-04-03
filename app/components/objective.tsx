import { Target, Flame, Users } from "lucide-react";

export function Objective() {
  const features = [
    {
      icon: Flame,
      title: "Constancia en la Oración",
      description:
        "Cultivamos el hábito de la oración diaria, manteniéndonos firmes en nuestra fe.",
    },
    {
      icon: Target,
      title: "Estudio Bíblico",
      description:
        "Profundizamos en las Escrituras a través del Evangelio de San Juan.",
    },
    {
      icon: Users,
      title: "Comunidad de Fe",
      description:
        "Nos apoyamos mutuamente en oración, compartiendo peticiones e intenciones.",
    },
  ];

  return (
    <section className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            Nuestro Objetivo
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-background rounded-2xl border border-border transition-all hover:shadow-xl hover:border-primary/30"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}