"use client";

import Image from "next/image";
import Modal from "@/components/Modal";
import { useState } from "react";
import Markdown from "../Markdown";
import { FaLock, FaUnlock } from "react-icons/fa";

export type HTBData = {
  id: string;
  name: string;
  difficulty: string;
  thumbnail: string;
  writeup: string;
  os: string;
  active: boolean;
};

export function HTB({
  name,
  difficulty,
  thumbnail,
  os,
  writeup,
  active,
}: HTBData) {
  const [writeupModalOpen, setWriteupModalOpen] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);

  if (!name) return null;

  function handleClick() {
    if (!active) {
      setWriteupModalOpen(true);
      return;
    }

    setShowPrivate(true);

    setTimeout(() => {
      setShowPrivate(false);
    }, 3000);

    console.log(writeup);
  }

  return (
    <div
      className="flex items-center w-[18.5rem] p-3 bg-bg-800 rounded-md group cursor-pointer relative group"
      onClick={handleClick}
    >
      <WriteupModal
        thumbnail={thumbnail}
        name={name}
        difficulty={difficulty}
        os={os}
        isOpen={writeupModalOpen}
        writeup={writeup}
        onClose={() => setWriteupModalOpen(false)}
      />

      <div className="absolute top-3 right-3 text-3xl group-hover:text-primary-500 transition-colors duration-300">
        {active ? (
          <FaLock className="text-orange-500 text-[1rem]" />
        ) : (
          <FaUnlock className="text-green-500 text-[1rem]" />
        )}
      </div>
      <div
        className={`flex items-center justify-center overflow-hidden bg-red-500 transition-all duration-500 w-full shadow-md text-xl absolute rounded-t-md top-0 left-0 ${
          showPrivate ? "h-10 " : "h-0 "
        }`}
      >
        Machine hasn't been retired yet.
      </div>
      <section className="flex items-center">
        <Image
          src={thumbnail}
          alt={name}
          width={70}
          height={70}
          className="rounded-full w-32 h-32 p-3"
        />
        <div className="flex flex-col h-full gap-2 p-2 w-96">
          <h1 className="text-xl text-left font-bold w-full text-ellipsis">
            {name}
          </h1>
          <div className="flex gap-5">
            <div className="flex flex-col">
              <span className="text-gray-400">OS</span>
              <span>{os}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400">Difficulty</span>
              <Difficulty difficulty={difficulty} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface DifficultyProps {
  difficulty: "Easy" | "Medium" | "Hard" | "Insane" | any;
}

function Difficulty(props: DifficultyProps) {
  let className = "";
  if (props.difficulty === "Easy") className += "text-green-500";
  if (props.difficulty === "Medium") className += "text-orange-500";
  if (props.difficulty === "Hard") className += "text-red-500";
  if (props.difficulty === "Insane") className += "text-primary-500";
  return <span className={className}>{props.difficulty}</span>;
}

interface WriteupPasswordProps {
  isOpen: boolean;
  writeup: string;
  thumbnail: string;
  name: string;
  difficulty: string;
  os: string;
  onClose: () => void;
}

function WriteupModal(props: WriteupPasswordProps) {
  return (
    <Modal onClose={props.onClose} isOpen={props.isOpen}>
      <section className="max-w-xl md:max-w-3xl xl:max-w-7xl bg-bg-800 rounded-md">
        <section className="flex flex-col overflow-y-auto overflow-x-hidden">
          <section className="flex items-center p-3">
            <Image
              src={props.thumbnail}
              alt={props.name}
              width={70}
              height={70}
              className="rounded-full w-32 h-32 p-3"
            />
            <div className="flex flex-col h-full gap-2 p-2 w-96">
              <h1 className="text-xl text-left font-bold w-full text-ellipsis">
                {props.name}
              </h1>
              <div className="flex gap-5">
                <div className="flex flex-col">
                  <span className="text-gray-400">OS</span>
                  <span>{props.os}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400">Difficulty</span>
                  <Difficulty difficulty={props.difficulty} />
                </div>
              </div>
            </div>
          </section>
          <Markdown className="p-3 h-[75vh] lg:h-[75vh]">
            {props.writeup}
          </Markdown>
        </section>
        <div className=""></div>
      </section>
    </Modal>
  );
}
