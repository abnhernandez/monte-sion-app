import { notFound, redirect } from "next/navigation"
import BirthdayDetailClient from "@/components/birthdays/BirthdayDetailClient"
import { BirthdayPageFrame } from "@/components/birthdays/birthday-ui"
import { BirthdayAuthError, assertBirthdayTeamAccess } from "@/lib/birthdays/auth"
import { getBirthdayDetailData } from "@/lib/birthdays/repository"

export default async function BirthdayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let data

  try {
    const actor = await assertBirthdayTeamAccess()
    data = await getBirthdayDetailData(id, actor)

    if (!data) {
      notFound()
    }
  } catch (error) {
    if (error instanceof BirthdayAuthError) {
      redirect(error.status === 401 ? "/login" : "/dashboard")
    }

    throw error
  }

  return (
    <BirthdayPageFrame>
      <BirthdayDetailClient key={`${data.upcomingOccurrence.id}:${data.upcomingOccurrence.updatedAt}`} data={data} />
    </BirthdayPageFrame>
  )
}
