"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Role } from "@prisma/client";
import { postRequestMessage } from "@/actions/requests";
import { formatDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { FileText, Paperclip, Send, X } from "lucide-react";

type Message = {
  id: string;
  body: string | null;
  fileName: string | null;
  fileUrl: string | null;
  createdAt: string;
  author: { name: string; role: string };
};

export function RequestChat({
  requestId,
  userId,
  userRole,
  initialMessages,
  closed,
}: {
  requestId: string;
  userId: string;
  userRole: Role;
  initialMessages: Message[];
  closed?: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [body, resizeTextarea]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isStaff = userRole === Role.STAFF || userRole === Role.ADMIN;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (closed) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    if (body.trim()) fd.set("body", body.trim());
    if (file) fd.set("file", file);
    const result = await postRequestMessage(userId, requestId, fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setBody("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    requestAnimationFrame(resizeTextarea);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        {initialMessages.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            {closed
              ? "This conversation is closed."
              : "No messages yet. Start the conversation or attach a document."}
          </p>
        ) : (
          initialMessages.map((m) => {
            const staffMsg =
              m.author.role === Role.STAFF || m.author.role === Role.ADMIN;
            const alignEnd = isStaff ? staffMsg : !staffMsg;
            return (
              <div
                key={m.id}
                className={cn("flex", alignEnd ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                    alignEnd
                      ? "bg-brand-600 text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex items-center justify-between gap-4 text-xs",
                      alignEnd ? "text-brand-100" : "text-slate-500"
                    )}
                  >
                    <span className="font-semibold">{m.author.name}</span>
                    <time dateTime={new Date(m.createdAt).toISOString()}>
                      {formatDateTime(m.createdAt)}
                    </time>
                  </div>
                  {m.body && (
                    <p
                      className={cn(
                        "whitespace-pre-wrap text-sm leading-relaxed",
                        alignEnd ? "text-white" : "text-slate-800"
                      )}
                    >
                      {m.body}
                    </p>
                  )}
                  {m.fileUrl && m.fileName && (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold",
                        alignEnd
                          ? "bg-brand-500 text-white hover:bg-brand-400"
                          : "bg-slate-100 text-brand-700 hover:bg-slate-200"
                      )}
                    >
                      <FileText className="h-4 w-4" />
                      {m.fileName}
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!closed && (
        <form onSubmit={send} className="space-y-2">
          {file && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs">
              <Paperclip className="h-4 w-4 text-slate-500" />
              <span className="flex-1 truncate font-medium">{file.name}</span>
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Remove file"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          )}
          <div className="flex w-full items-start gap-2">
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,image/*,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              className="min-h-11 max-h-[200px] min-w-0 flex-1 resize-none overflow-y-auto rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed shadow-sm transition focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Write a message…"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                resizeTextarea();
              }}
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
