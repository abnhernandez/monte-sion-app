import { BookOpen, Heart } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
          <Heart className="w-4 h-4" />
          <span className="text-sm font-medium">Colosenses 4:2</span>
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
          Grupo de Estudio Bíblico y Oración
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto text-pretty">
          Mantenernos siempre constantes en la oración.
        </p>

        <blockquote className="text-lg text-primary/80 italic mb-12 max-w-xl mx-auto">
          {'"Perseverad en la oración, velando en ella con acción de gracias"'}
        </blockquote>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#participar"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold transition-all hover:bg-primary/90 hover:shadow-lg"
          >
            <Heart className="w-5 h-5" />
            ¿Cómo Participar?
          </a>
          <a
            href="#plan-lectura"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground border border-border rounded-lg font-semibold transition-all hover:bg-secondary hover:shadow-lg"
          >
            <BookOpen className="w-5 h-5" />
            Plan de Lectura
          </a>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}