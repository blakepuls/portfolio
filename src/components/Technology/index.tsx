import Image from "next/image";
import fs from "fs";

interface TechnologyProps {
  name: string;
  src?: string;
  rounded?: boolean;
}

export default function Technology({ name, src, rounded }: TechnologyProps) {
  if (rounded === undefined) rounded = true;

  return (
    <div className="flex justify-center p-2 items-center gap-3">
      <Image
        src={
          src
            ? `/images/technology/${src}.svg`
            : `/images/technology/${name}.svg`
        }
        alt={name}
        width={50}
        height={50}
        className={`${rounded && `rounded-full`} h-16 w-16`}
      />
      <span className="text-3xl text-neutral-200">{name}</span>
    </div>
  );
}
