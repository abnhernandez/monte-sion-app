import React from "react";
import Image from "next/image";
import Link from "next/link";
// Si usas React Router, reemplaza lo anterior por:
// import { useNavigate } from "react-router-dom";

interface CardProps {
  title: string;
  image?: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
  href?: string; // nueva prop para la ruta
  className?: string;
  elevation?: 1 | 2 | 3 | 4 | 5;
}

const elevationClasses = {
  1: "shadow-sm",
  2: "shadow-md",
  3: "shadow-lg",
  4: "shadow-xl",
  5: "shadow-2xl",
};

export default function Card({
  title,
  image,
  buttonText = "Explorar",
  onButtonClick,
  href, // usar esta prop para navegar
  className = "",
  elevation = 5,
}: CardProps) {
  return (
    <div
      className={`
        rounded-2xl overflow-hidden 
        ${elevationClasses[elevation]}
        transition-shadow duration-300 hover:shadow-xl
        w-full max-w-sm mx-auto
        ${className}
      `}
    >
      <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-teal-400 to-teal-500 relative">
        {typeof image === "string" ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          image
        )}
      </div>

      <div className="px-5 py-4">
        <h3 className="font-bold text-lg mb-3">{title}</h3>

        <div className="flex justify-end">
          {href ? (
            <Link
              href={href}
              className="bg-red-900 hover:bg-red-800 font-medium py-1.5 px-4 rounded-lg transition-colors duration-200 inline-block"
            >
              {buttonText}
            </Link>
          ) : onButtonClick ? (
            <button
              onClick={onButtonClick}
              className="bg-red-900 hover:bg-red-800 font-medium py-1.5 px-4 rounded-lg transition-colors duration-200"
            >
              {buttonText}
            </button>
          ) : (
            <span
              className="bg-red-900 hover:bg-red-800 font-medium py-1.5 px-4 rounded-lg transition-colors duration-200 inline-block"
            >
              {buttonText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Uso:
// <Card title="Producto" image="/img.png" href="/productos/123" />
// o si prefieres manejarlo con onButtonClick:
// <Card title="Producto" onButtonClick={() => router.push('/productos/123')} />
