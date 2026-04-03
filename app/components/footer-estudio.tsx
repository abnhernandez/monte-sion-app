import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 bg-foreground text-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center">
          <p className="font-serif text-2xl mb-4">
            Grupo de Estudio Bíblico y Oración
          </p>
          <p className="text-background/70 mb-6 italic">
            {'"Perseverad en la oracion, velando en ella con accion de gracias"'}
            <br />
            <span className="text-sm">- Colosenses 4:2</span>
          </p>
          <div className="flex items-center justify-center gap-2 text-background/60 text-sm">
            <span>Hecho con</span>
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span>para la gloria de Dios</span>
          </div>
        </div>
      </div>
    </footer>
  );
}