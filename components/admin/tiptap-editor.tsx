// components/admin/tiptap-editor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

import {
  Bold,
  Italic,
  ListOrdered,
  List,
  Underline as UnderlineIcon,
} from "lucide-react"; // Using lucide-react for icons, aliasing Underline icon
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type TipTapEditorProps = {
  value: string;
  dir?: "ltr" | "rtl";
  onChange: (value: string) => void;
  immediatelyRender?: boolean;
};

export function TipTapEditor({
  value,
  dir = "ltr",
  immediatelyRender = false,
  onChange,
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender,
    extensions: [StarterKit, Underline],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[100px] px-2",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    content: value,
  });

  return (
    <div className="border rounded-md p-2">
      {editor && ( // Render toolbar only when editor is ready
        <ToggleGroup type="multiple" size="sm" className="mb-2">
          <ToggleGroupItem
            value="bold"
            aria-label="Toggle bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            data-state={editor.isActive("bold") ? "on" : "off"}
          >
            <Bold className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="italic"
            aria-label="Toggle italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            data-state={editor.isActive("italic") ? "on" : "off"}
          >
            <Italic className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="underline"
            aria-label="Toggle underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            data-state={editor.isActive("underline") ? "on" : "off"}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="bulletList"
            aria-label="Toggle bullet list"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            data-state={editor.isActive("bulletList") ? "on" : "off"}
          >
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="orderedList"
            aria-label="Toggle ordered list"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
            data-state={editor.isActive("orderedList") ? "on" : "off"}
          >
            <ListOrdered className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      )}
      <EditorContent editor={editor} dir={dir} />
    </div>
  );
}
