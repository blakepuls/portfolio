import { Project, ProjectData } from "@/components/Project";
import matter from "gray-matter";
import path from "path";
import fs from "fs";
import About from "@/components/About";
import Intro from "@/components/Intro";
import { HTB, HTBData } from "@/components/HTB";
import { MdInfoOutline } from "react-icons/md";
import { useRef } from "react";

async function getSortedProjectsData(): Promise<ProjectData[]> {
  const projectsDirectory = path.join(process.cwd(), "src/projects");
  const fileNames = fs.readdirSync(projectsDirectory);
  const allProjectsData = await Promise.all(
    fileNames.map(async (fileName) => {
      const id = fileName.replace(/\.md$/, "");
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);
      const order = matterResult.data.order ?? 999;

      return {
        id,
        title: matterResult.data.title,
        thumbnail: matterResult.data.thumbnail,
        sourceCodeLink: matterResult.data.sourceCodeLink,
        year: matterResult.data.year,
        techUsed: matterResult.data.techUsed,
        private: matterResult.data.private,
        description: matterResult.content,
        order,
      } as ProjectData;
    })
  );

  // Sort by year, if it's "Current" then it's at the top, then by order. So current - 2024 - 2023 - 2022 - 2021
  return allProjectsData.sort((a, b) => {
    if (a.year === "Current" && b.year !== "Current") {
      return -1;
    } else if (a.year !== "Current" && b.year === "Current") {
      return 1;
    }

    if (a.year < b.year) {
      return 1;
    } else if (a.year > b.year) {
      return -1;
    }

    return a.order - b.order;
  });
}

async function getSortedHTBData(): Promise<HTBData[]> {
  const projectsDirectory = path.join(process.cwd(), "src/writeups");
  const fileNames = fs.readdirSync(projectsDirectory);
  const allProjectsData = await Promise.all(
    fileNames.map(async (fileName) => {
      const id = fileName.replace(/\.md$/, "");
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        id,
        writeup: matterResult.data.active ? undefined : matterResult.content,
        ...matterResult.data,
      } as HTBData;
    })
  );

  // Sort by non active, then by difficulty
  // Insane -> Hard -> Medium -> Easy
  return allProjectsData.sort((a, b) => {
    if (a.active && !b.active) {
      return 1;
    } else if (!a.active && b.active) {
      return -1;
    }

    if (a.difficulty === "Insane" && b.difficulty !== "Insane") {
      return -1;
    } else if (a.difficulty !== "Insane" && b.difficulty === "Insane") {
      return 1;
    }

    if (a.difficulty === "Hard" && b.difficulty !== "Hard") {
      return -1;
    } else if (a.difficulty !== "Hard" && b.difficulty === "Hard") {
      return 1;
    }

    if (a.difficulty === "Medium" && b.difficulty !== "Medium") {
      return -1;
    } else if (a.difficulty !== "Medium" && b.difficulty === "Medium") {
      return 1;
    }

    if (a.difficulty === "Easy" && b.difficulty !== "Easy") {
      return -1;
    } else if (a.difficulty !== "Easy" && b.difficulty === "Easy") {
      return 1;
    }

    return 0;
  });
}

export default async function Home() {
  const posts = await getSortedProjectsData();
  const writeups = await getSortedHTBData();

  return (
    <main className="flex flex-col items-center w-full h-full flex-1">
      <section className="w-full max-w-xl md:max-w-3xl xl:max-w-7xl flex flex-col gap-10 pb-14 px-5">
        <Intro />
        <About />
      </section>

      <section className="flex flex-col items-center w-full h-full flex-1 bg-bg-950 p-5">
        <section className="max-w-xl md:max-w-3xl xl:max-w-7xl">
          <section className="mt-3 flex flex-col w-full gap-3">
            <h1 className="text-3xl font-bold">HackTheBox Writeups</h1>
            <div className="flex gap-3 overflow-x-auto pb-3 w-full overflow-y-auto xl:grid xl:grid-cols-4 xl:gap-6 xl:h-96 xl:overflow-y-auto xl:overflow-x-hidden">
              {writeups.map((writeup) => {
                return (
                  <HTB
                    os={writeup.os}
                    difficulty={writeup.difficulty}
                    id={writeup.id}
                    name={writeup.name}
                    thumbnail={writeup.thumbnail}
                    writeup={writeup.writeup}
                    active={writeup.active}
                  />
                );
              })}
            </div>
          </section>

          <section className="mt-5 flex flex-col w-full gap-3">
            <h1 className="text-3xl font-bold">Projects</h1>
            {posts.map((post) => {
              return (
                <Project
                  key={post.id}
                  project={{
                    id: post.id,
                    title: post.title,
                    thumbnail: post.thumbnail,
                    sourceCodeLink: post.sourceCodeLink,
                    year: post.year,
                    techUsed: post.techUsed,
                    private: post.private,
                    description: post.description,
                    order: post.order,
                  }}
                />
              );
            })}
          </section>

          {/* <section className="max-w-xl md:max-w-3xl xl:max-w-7xl mt-10 flex flex-col items-center gap-5 h-full max-h-full">
            <div className="flex flex-wrap gap-3 items-center justify-center w-full backdrop-blur-lg p-3 bg-bg-900 rounded-lg shadow-md bg-opacity-50">
              <Technology name="TypeScript" />
              <Technology name="JavaScript" />
              <Technology name="Node.js" />
              <Technology name="CSharp" src="csharp" />
              <Technology name=".NET" src="dotnet" />
              <Technology name="Python" src="python" />
              <Technology name="PowerShell" rounded={false} />
              <Technology name="MySQL" />
              <Technology name="Postgres" />
              <Technology name="MongoDB" />
              <Technology name="Redis" rounded={false} />
              <Technology name="AWS" />
              <Technology name="GCP" />
              <Technology name="Firebase" />
              <Technology name="Linux" />
              <Technology name="Proxmox" />
              <Technology name="Windows Server" src="windows" rounded={false} />
              <Technology name="Docker" />
            </div>
          </section> */}
        </section>
      </section>
    </main>
  );
}
