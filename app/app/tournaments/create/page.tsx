import { CreateTournamentForm } from "@/components/create-tournament-form";
import { Separator } from "@/components/ui/separator";

export default function CreateTournamentPage() {
  return (
    <div className="container py-10 lg:px-80">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          ⚔️ Create tournament
        </h2>
        <p className="text-muted-foreground">
          Win to get all the XP, or lose everything
        </p>
      </div>
      <Separator className="my-6" />
      <CreateTournamentForm />
    </div>
  );
}
