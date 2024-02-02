import { Tournament } from "@/components/tournament";

export default function TournamentPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-10 lg:px-80">
      <Tournament id={params.id} />
    </div>
  );
}
