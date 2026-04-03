import { redirect } from "next/navigation"
import BirthdayDashboardClient from "@/components/birthdays/BirthdayDashboardClient"
import { BirthdayPageFrame } from "@/components/birthdays/birthday-ui"
import { BirthdayAuthError, assertBirthdayTeamAccess } from "@/lib/birthdays/auth"
import { getBirthdayDashboardData } from "@/lib/birthdays/repository"

export default async function BirthdaysPage() {
  let data

  try {
    const actor = await assertBirthdayTeamAccess()
    data = await getBirthdayDashboardData(actor)
  } catch (error) {
    if (error instanceof BirthdayAuthError) {
      redirect(error.status === 401 ? "/login" : "/dashboard")
    }

    throw error
  }

  return (
    <BirthdayPageFrame>
      <BirthdayDashboardClient data={data} />
    </BirthdayPageFrame>
  )
}
