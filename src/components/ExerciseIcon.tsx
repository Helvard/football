import {
  Dumbbell,
  Footprints,
  Gauge,
  Repeat,
  Shuffle,
  Target,
  Timer,
  Zap,
} from "lucide-react";

export default function ExerciseIcon({
  category,
  className,
}: {
  category: string | null;
  className?: string;
}) {
  const c = (category ?? "").toLowerCase();

  const Icon =
    c === "førsteberøring"
      ? Footprints
      : c === "pasning"
        ? Repeat
        : c === "dribling"
          ? Shuffle
          : c === "afslutning"
            ? Target
            : c === "speed"
              ? Zap
              : c === "agility"
                ? Timer
                : c === "boldkontrol"
                  ? Gauge
                  : c === "styrke"
                    ? Dumbbell
                    : Dumbbell;

  return <Icon className={className ?? "h-4 w-4"} />;
}
