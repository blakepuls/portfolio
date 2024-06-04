import "./globals.css";
import { AiFillLinkedin, AiFillGithub } from "react-icons/ai";
import { IconType } from "react-icons";
import FloatingCubes from "@/components/FloatingCubes";

export const metadata = {
  title: "Blake Puls's Portfolio",
  description: "Explore my projects and posts about software development.",
  openGraph: {
    title: "Blake Puls's Portfolio",
    description: "Explore my projects and posts about software development.",
    url: "https://blakepuls.dev",
    siteName: "Blake Puls",
    locale: "en-US",
    type: "website",
    images: ["https://blakepuls.dev/images/profile.gif"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-bg-900 flex flex-col min-h-screen">
        <div className="fixed h-full w-full -z-10 ">
          <div className="bg-black bg-opacity-50 absolute h-full w-full z-10"></div>
          <FloatingCubes
            background="#000"
            config={{
              amount: 100,
              speed: 0.5,
              color: "#8423d9",
            }}
          />
        </div>
        <div className="bg-bg-900 bg-opacity-30 h-full w-full fixed -z-10"></div>
        <header className="bg-transparent w-full">
          <div className="flex py-10 items-center max-w-7xl w-full m-auto h-2 px-5">
            <div className="w-full sm:block hidden">
              <a href="/" className="text-3xl">
                blake.puls@outlook.com
              </a>
            </div>
            <nav className="flex items-center w-full justify-end gap-3 ">
              <a
                href="https://www.linkedin.com/in/blake-puls-752a37272/"
                target="_blank"
              >
                <div className="flex items-center gap-1 transition-colors hover:text-primary-500">
                  <AiFillLinkedin className="text-4xl" />
                </div>
              </a>
              <a href="https://github.com/blakepuls" target="_blank">
                <div className="flex items-center gap-1 transition-colors hover:text-primary-500">
                  <AiFillGithub className="text-4xl" />
                </div>
              </a>
            </nav>
          </div>
        </header>

        <div className="w-full m-auto flex flex-col items-center mt-10 500 flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
