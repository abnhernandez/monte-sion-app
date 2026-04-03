import ForgotPasswordForm from "@/app/components/forgot"
import AuthLayout from "@/app/components/AuthLayout"

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace de recuperación"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}