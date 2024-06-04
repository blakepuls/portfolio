import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface MarkdownProps {
  children: string;
  className?: string;
}

export default function Markdown(props: MarkdownProps) {
  return (
    <ReactMarkdown
      className={`markdown overflow-y-auto rounded-md overflow-x-hidden flex flex-col ${props.className}`}
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");

          if (inline) {
            return (
              <code className="!bg-bg-950 px-1 py-0.5 rounded-md shadow-md">
                {children}
              </code>
            );
          }

          return !inline && match ? (
            <SyntaxHighlighter
              style={atomDark}
              PreTag="div"
              language={match[1]}
              customStyle={{
                background: "#0F0F13",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)",
              }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={`${className}`} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {props.children}
    </ReactMarkdown>
  );
}
