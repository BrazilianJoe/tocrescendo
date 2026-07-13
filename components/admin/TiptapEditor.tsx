"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef } from "react";
import { getTiptapExtensions } from "@/lib/tiptap-extensions";

type Props = {
  initialContent: Record<string, unknown>;
  onChange: (json: Record<string, unknown>) => void;
};

export function TiptapEditor({ initialContent, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getTiptapExtensions(),
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose-blog min-h-[22rem] max-w-none px-5 py-5 focus:outline-none sm:px-7 sm:py-6",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON() as Record<string, unknown>);
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(initialContent);
    if (current !== next) {
      editor.commands.setContent(initialContent);
    }
  }, [editor, initialContent]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Falha no upload");
        return;
      }
      editor
        .chain()
        .focus()
        .insertContent({
          type: "optimizedImage",
          attrs: {
            src: data.src,
            alt: data.alt || "",
            srcAvif: data.srcAvif,
            srcWebp: data.srcWebp,
            width: data.width,
            height: data.height,
          },
        })
        .run();
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="rounded-[1.5rem] border border-border bg-surface/80 px-6 py-16 text-center text-sm text-muted">
        Preparando o editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-border/80 bg-surface shadow-[0_18px_40px_-30px_rgb(90_143_176_/_0.55)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-border/80 bg-background/70 px-3 py-2.5 sm:px-4">
        <ToolbarButton
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <ToolbarButton
          label="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <ToolbarDivider />
        <ToolbarButton
          label="Negrito"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="font-semibold"
        />
        <ToolbarButton
          label="Itálico"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="italic"
        />
        <ToolbarDivider />
        <ToolbarButton
          label="Lista"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="Numerada"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarDivider />
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={() => {
            const prev = editor.getAttributes("link").href as
              | string
              | undefined;
            const url = window.prompt("URL do link", prev ?? "https://");
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
          }}
        />
        <ToolbarButton
          label="Imagem"
          onClick={() => fileRef.current?.click()}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void uploadImage(file);
            e.target.value = "";
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />;
}

function ToolbarButton({
  label,
  onClick,
  active,
  className = "",
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
        active
          ? "bg-primary-dark text-white"
          : "text-muted hover:bg-primary-light/35 hover:text-foreground"
      } ${className}`}
    >
      {label}
    </button>
  );
}
