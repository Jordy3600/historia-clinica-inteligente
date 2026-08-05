import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

/**
 * Renderizado limpio y clínico de respuestas de la IA (estilo del diseño HistorIA).
 */
export default function MarkdownMessage({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text) return null;

  return (
    <div className={cn('text-[13.5px] leading-[1.75] text-text-1/90', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="mt-5 mb-2 text-[15px] font-bold text-text-1">{children}</h2>
          ),
          h2: ({ children }) => (
            <h3 className="mt-5 mb-2 text-[14.5px] font-bold text-text-1">{children}</h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-4 mb-1.5 text-[13.5px] font-bold text-text-1">{children}</h4>
          ),
          p: ({ children }) => <p className="my-2.5">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold text-text-1">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-text-1/90">{children}</em>,
          ul: ({ children }) => (
            <ul className="my-2.5 space-y-1.5 pl-5 list-disc marker:text-teal">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 space-y-1.5 pl-5 list-decimal marker:text-teal marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-teal underline underline-offset-2 hover:text-teal-2"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-teal/60 bg-teal/5 px-4 py-2 rounded-r-xl text-text-1/85">
              {children}
            </blockquote>
          ),
          code: ({ className: c, children }) => {
            const isBlock = (c ?? '').includes('language-');
            if (isBlock) {
              return (
                <code className="block my-3 overflow-x-auto rounded-xl border border-border bg-black/60 p-3 font-mono text-[12px] text-teal-2">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded-md bg-white/8 px-1.5 py-0.5 font-mono text-[12px] text-teal-2">
                {children}
              </code>
            );
          },
          hr: () => <hr className="my-4 border-border/70" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-[12.5px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-border bg-white/4 px-3 py-2 text-left font-bold text-text-1">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-border/60 px-3 py-2 text-text-1/85">{children}</td>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
