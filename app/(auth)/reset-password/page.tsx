import ResetPasswordForm from "@/app/components/ResetPasswordForm"
import AuthLayout from "@/app/components/AuthLayout"

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Restablecer contraseña"
      subtitle="Elige una nueva contraseña segura"
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}