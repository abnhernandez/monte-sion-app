import DeleteAccountButton from "@/app/components/delete"

export default function DeleteAccountPage() {
    return (
        <div className="min-h-screen px-4 py-10">
            <div className="mx-auto w-full max-w-xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold">Eliminar cuenta</h1>
                    <p className="text-sm text-neutral-500">
                        Esta acción es permanente y no se puede deshacer.
                    </p>
                </div>
                <DeleteAccountButton />
            </div>
        </div>
    )
}