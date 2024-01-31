import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function IndexPage() {
  return (
    <div className="container flex flex-col gap-12 pb-8 pt-6 lg:h-[calc(100vh-4rem)] lg:flex-row lg:items-center lg:px-36">
      {/* Text with button */}
      <section className="flex flex-col gap-8 lg:basis-1/2">
        <div className="flex flex-col max-w-[980px] items-start gap-4">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            🏆 Launch tournaments
          </h1>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl text-muted-foreground">
            ⚔️ <span className="text-muted-foreground">Beat opponents</span>
          </h1>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            🪙 <span className="text-muted-foreground/80">Earn XP</span>
          </h1>
        </div>
        <div className="flex">
          <Button size="lg">Create Tournament</Button>
        </div>
      </section>
      {/* Image */}
      <section className="flex flex-col lg:basis-1/2 lg:items-center">
        <Image
          src="/images/demo.png"
          alt="Demo"
          priority={false}
          width="100"
          height="100"
          sizes="100vw"
          className="w-full md:w-1/2 lg:w-1/2"
        />
      </section>
    </div>
  );
}
