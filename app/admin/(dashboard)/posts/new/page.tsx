import { emptyDoc } from "@/lib/empty-doc";
import { PostEditor, type PostForm } from "@/components/admin/PostEditor";

export default function NewPostPage() {
  const initial: PostForm = {
    title: "",
    summary: "",
    status: "DRAFT",
    content: { ...emptyDoc },
  };

  return <PostEditor initial={initial} />;
}
