import Form from "@/app/components/form";
import { getAccount } from "@/lib/account";
import { buildPrayerRequestAutofill } from "@/lib/form-autofill";

export const metadata = {
  title: "Monte Sion Oaxaca",
  description:
    "Estableciendo el Reino de Dios — Un lugar para ti en el Reino de Dios",
};

export default async function Home() {
  const profile = await getAccount();
  const autofill = buildPrayerRequestAutofill(profile);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      <div className="pt-6 pb-12">
        <Form autofill={autofill} />
      </div>
    </div>
  );
}
