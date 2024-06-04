"use client";

import Image from "next/image";
import { BsFileEarmarkText } from "react-icons/bs";

export default function Intro() {
  function scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  return (
    <div className="flex justify-center w-full ">
      <div className="flex flex-col items-center gap-5 w-full">
        <h1 className="text-left mr-auto text-4xl  text-neutral-200">
          Hello, my name is{" "}
          <span className="bg-gradient-to-r from-primary-600 to-primary-500 font-bold text-transparent bg-clip-text whitespace-nowrap">
            Blake Puls
          </span>
        </h1>

        <h1 className="text-2xl w-full  text-neutral-200">
          and I'm a{" "}
          <span className="bg-gradient-to-r from-primary-600 to-primary-500 font-bold text-transparent bg-clip-text whitespace-nowrap">
            Software Engineer
          </span>
        </h1>

        <section className="flex mr-auto gap-3">
          <a
            href="https://docs.google.com/document/d/1qraTguTjcw2sCoa9v0ebkUv0iGFVW3HRQYVhmkbmNcQ/export?format=pdf"
            className="btn-primary h-12 mr-auto mt-auto"
          >
            View Resume
            <BsFileEarmarkText />
          </a>

          <button
            className="btn-secondary h-12 mr-auto mt-auto"
            onClick={scrollToBottom}
          >
            View Projects
          </button>
        </section>
      </div>
    </div>
  );
}
