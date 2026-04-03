"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { campRegistrationDefaults } from "@/lib/camp/constants";
import type { CampRegistrationFormValues } from "@/lib/camp/types";
import { formSchema } from "@/lib/validation";

export const useFormZod = () => {
  return useForm<CampRegistrationFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: campRegistrationDefaults,
  });
};
