import Image from "next/image";

interface ProjectProps {
  id: number | undefined;
  title: string;
  description: string;
  tech: string[];
  source?: string;
  post: string;
  image: string;
}

export default function Technology({ id, title, description }: ProjectProps) {
  return (
    <div className="flex justify-center p-3 bg-bg-800 rounded-md shadow-md bg-opacity-50 items-center gap-3"></div>
  );
}
