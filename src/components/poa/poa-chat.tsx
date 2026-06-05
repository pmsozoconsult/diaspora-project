"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Role } from "@prisma/client";
import { postPoaMessage } from "@/actions/poa-chat";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format-date";
import { cn } from "@/lib/utils";
import { MessageSquare, Paperclip, Send, FileText, X } from "lucide-react";

type PoaMessageView = {
  id: string;
  body: string | null;
  fileName: string | null;
  fileUrl: string | null;
  createdAt: string;
  author: { name: string; role: Role };
};

export function PoaChat({
  poaCaseId,
  userRole,
  initialMessages,
  closed,
}: {
  poaCaseId: string;
  userRole: Role;
  initialMessages: PoaMessageView[];
  closed?: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (closed) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    if (body.trim()) fd.set("body", body.trim());
    if (file) fd.set("file", file);
    const result = await postPoaMessage(poaCaseId, fd);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setBody("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  const isStaff = userRole === Role.STAFF || userRole === Role.ADMIN;

  return (
    <div className="rounded-2xl border border-violet-200/80 bg-gradient-to-b from-violet-50/40 to-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-violet-100 px-5 py-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
          <MessageSquare className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-slate-900">POA support chat</p>
          <p className="text-xs text-slate-500">
            Only for power of attorney — not service requests.{" "}
            {closed ? "Chat closed." : "Attach files if needed."}
          </p>
        </div>
      </div>

      <div className="max-h-[400px] space-y-3 overflow-y-auto p-4">
        {initialMessages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-500">
            {closed
              ? "This conversation is archived."
              : "Say hello and tell us which MOFA / embassy step you are on."}
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
                      ? "bg-violet-600 text-white"
                      : "border border-slate-200 bg-white text-slate-800"
                  )}
                >
                  <div
                    className={cn(
                      "mb-1 flex items-center justify-between gap-3 text-xs",
                      alignEnd ? "text-violet-200" : "text-slate-500"
                    )}
                  >
                    <span className="font-semibold">{m.author.name}</span>
                    <time dateTime={new Date(m.createdAt).toISOString()}>
                      {formatDateTime(m.createdAt)}
                    </time>
                  </div>
                  {m.body && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.body}</p>
                  )}
                  {m.fileUrl && m.fileName && (
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold",
                        alignEnd
                          ? "bg-violet-500 text-white hover:bg-violet-400"
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
        <form onSubmit={send} className="border-t border-violet-100 p-4">
          {file && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs">
              <Paperclip className="h-4 w-4 text-slate-500" />
              <span className="flex-1 truncate font-medium">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} aria-label="Remove file">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
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
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
              aria-label="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
              rows={2}
              placeholder="Message our POA team…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-11 shrink-0 bg-violet-600 hover:bg-violet-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
