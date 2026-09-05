import { Extension } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useRef, useState } from "react";
import { ApiError, mediaApi } from "../lib/api";
import UploadSizeHint from "./UploadSizeHint";

/**
 * Swaps the default Enter / Shift+Enter behavior: plain Enter inserts a
 * tight line break (small spacing, stays in the same paragraph) while
 * Shift+Enter starts a new paragraph (large spacing). Enter still creates
 * a new list item / code block line as usual.
 */
const SwappedEnterBehavior = Extension.create({
  name: "swappedEnterBehavior",
  priority: 1000,
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        if (this.editor.isActive("listItem") || this.editor.isActive("codeBlock")) {
          return false;
        }
        return this.editor.commands.setHardBreak();
      },
      "Shift-Enter": () => this.editor.commands.splitBlock(),
    };
  },
});

interface RichTextEditorProps {
  /** Initial HTML content. Only read on mount — this component owns its own
   * editing state afterwards and reports changes via `onChange`. */
  initialContent: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ initialContent, onChange }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false, autolink: false },
      }),
      Image.configure({ inline: false }),
      SwappedEnterBehavior,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "rich-text-content" },
    },
  });

  async function handleInsertImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;

    setUploadingImage(true);
    setUploadError(null);
    try {
      const res = await mediaApi.upload(file, "news");
      editor.chain().focus().setImage({ src: res.url, alt: "" }).run();
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "图片上传失败");
    } finally {
      setUploadingImage(false);
    }
  }

  function toggleLink() {
    if (!editor) return;
    const existing = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("链接地址", existing ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <button
          type="button"
          className={editor.isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          粗体
        </button>
        <button
          type="button"
          className={editor.isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          斜体
        </button>
        <button
          type="button"
          className={editor.isActive("underline") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          下划线
        </button>
        <button
          type="button"
          className={editor.isActive("strike") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          删除线
        </button>
        <span className="toolbar-divider" />
        <button
          type="button"
          className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          标题2
        </button>
        <button
          type="button"
          className={editor.isActive("heading", { level: 3 }) ? "active" : ""}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          标题3
        </button>
        <span className="toolbar-divider" />
        <button
          type="button"
          className={editor.isActive("bulletList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          项目符号
        </button>
        <button
          type="button"
          className={editor.isActive("orderedList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          编号列表
        </button>
        <button
          type="button"
          className={editor.isActive("blockquote") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          引用
        </button>
        <button
          type="button"
          className={editor.isActive("codeBlock") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          代码块
        </button>
        <span className="toolbar-divider" />
        <button type="button" className={editor.isActive("link") ? "active" : ""} onClick={toggleLink}>
          链接
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage}>
          {uploadingImage ? "上传中…" : "插入图片"}
        </button>
        <UploadSizeHint spec="richTextImage" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          hidden
          onChange={handleInsertImage}
        />
        <span className="toolbar-divider" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()}>
          撤销
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}>
          重做
        </button>
      </div>
      {uploadError && <p className="form-error">{uploadError}</p>}
      <EditorContent editor={editor} />
    </div>
  );
}
