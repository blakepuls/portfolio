"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { LuArrowRight } from "react-icons/lu";
import Markdown from "../Markdown";
import { AiFillGithub } from "react-icons/ai";

export type ProjectData = {
  id: string;
  title: string;
  thumbnail: string;
  sourceCodeLink: string;
  year: string;
  techUsed: string[];
  private: boolean;
  description: string;
  order: number;
};

interface ProjectProps {
  project: ProjectData;
}

export function Project({ project }: ProjectProps) {
  const [showModal, setShowModal] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setTimeout(() => {
      if (contentRef.current && !showModal) {
        contentRef.current.style.maxHeight = `${50}px`; // Add 20 pixels
      }
    }, 10);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      if (contentRef.current && !showModal) {
        contentRef.current.style.maxHeight = `${0}`;
      }
    }, 750);
  };

  function handleClick() {
    if (showModal) {
      contentRef.current!.style.maxHeight = "0";
      setTimeout(() => setShowModal(false), 800);
    } else {
      setShowModal(true);
    }
  }

  useEffect(() => {
    if (showModal && contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      contentRef.current.style.maxHeight = `${contentHeight}px`;
    }
  }, [showModal]);

  function repoClick(event: any, url: string) {
    event.stopPropagation();
    if (project.private) {
      setShowPrivate(true);
      setTimeout(() => {
        setShowPrivate(false);
      }, 2000);
      return;
    }

    window.open(url, "_blank");
  }

  function ellipsisText(text: string, wordCount: number) {
    return text.split(" ").slice(0, wordCount).join(" ") + "...";
  }

  return (
    <div
      className="flex w-full p-3 bg-bg-800 rounded-md group cursor-pointer transition-all duration-500"
      ref={mainRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <section className="flex flex-col w-full transition-all duration-500">
        <div className="flex items-center gap-3">
          <section
            className={`flex gap-3 items-center group transition-colors duration-300 ${
              showPrivate ? "text-red-500" : "hover:text-primary-500"
            }`}
            onClick={(e) => {
              repoClick(e, project.sourceCodeLink);
            }}
          >
            {showPrivate ? (
              <>
                <AiFillGithub className={`text-red-500 text-3xl`} />
                <h1 className="text-2xl text-red-500">Private Source</h1>
              </>
            ) : (
              <>
                <AiFillGithub className={`text-3xl`} />
                <h1 className="text-2xl">
                  {`${project.title} • ${project.year}`}
                </h1>
              </>
            )}
          </section>

          <LuArrowRight
            className={`ml-auto text-3xl transition-transform duration-300 ease-in-out group-hover:text-primary-500 ${
              showModal ? "rotate-90" : "group-hover:rotate-45"
            }`}
          />
        </div>
        <div className="flex gap-2 flex-wrap mt-3">
          {project.techUsed.map((tech) => (
            <Tech key={tech} tech={tech} />
          ))}
        </div>
        <div
          ref={contentRef}
          style={{
            maxHeight: "0",
            transition: "max-height 0.2s ease-in-out",
            overflow: "hidden",
          }}
        >
          <section className="flex flex-col items-center gap-3 mt-3 h-full">
            <section className="flex flex-col gap-3 w-full">
              <Markdown>
                {!showModal
                  ? ellipsisText(project.description, 5)
                  : project.description}
              </Markdown>
            </section>
          </section>
        </div>
      </section>
    </div>
  );
}

interface TechProps {
  tech: string;
}

export function Tech({ tech }: TechProps) {
  const [showImage, setShowImage] = useState(true);

  let imgSrc = tech;

  switch (tech) {
    case "C#":
      imgSrc = "csharp";
      break;
    case ".NET":
      imgSrc = "dotnet";
      break;
  }

  return (
    <div className="flex justify-center p-1 bg-gradient-to-r from-bg-800  to-bg-700 h-10 rounded-md shadow-md bg-opacity-50 items-center gap-1">
      {showImage && (
        <Image
          src={`/images/technology/${imgSrc}.svg`}
          alt={tech}
          width={50}
          height={50}
          onError={(e) => {
            setShowImage(false);
          }}
          className="rounded-full shadow-md w-8 h-8 "
        />
      )}
      <span className="text-md text-neutral-200 ">{tech}</span>
    </div>
  );
}
