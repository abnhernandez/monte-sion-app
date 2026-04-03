import { redirect } from "next/navigation"
import BirthdayAdminClient from "@/components/birthdays/BirthdayAdminClient"
import { BirthdayPageFrame } from "@/components/birthdays/birthday-ui"
import { BirthdayAuthError, assertBirthdayAdminAccess } from "@/lib/birthdays/auth"
import { getBirthdayAdminData } from "@/lib/birthdays/repository"

export default async function BirthdayAdminPage() {
  let data

  try {
    const actor = await assertBirthdayAdminAccess()
    data = await getBirthdayAdminData(actor)
  } catch (error) {
    if (error instanceof BirthdayAuthError) {
      redirect(error.status === 401 ? "/login" : "/birthdays")
    }

    throw error
  }

  return (
    <BirthdayPageFrame>
      <BirthdayAdminClient data={data} />
    </BirthdayPageFrame>
  )
}
