import Image from "next/image";

interface AboutProps {}

export default function About({}: AboutProps) {
  return (
    <div className="">
      <p className="text-2xl text-neutral-200">
        I'm a self-driven enthusiast with a passion for IT and programming. For
        the past 6 years, I've been learning and working with various
        technologies as a freelancer and hobbyist. I'm not afraid of challenges
        and I'm always ready to learn new tools and languages. When I encounter
        a problem, I see it as an opportunity to learn and grow, and I don't
        stop until I've found the right solution.
      </p>
    </div>
  );
}
