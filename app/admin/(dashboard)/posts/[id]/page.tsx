import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { getPostById } from "@/lib/posts";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <PostEditor
      initial={{
        id: post.id,
        title: post.title,
        summary: post.summary,
        slug: post.slug,
        status: post.status,
        content: post.content as Record<string, unknown>,
        coverAvifUrl: post.coverAvifUrl,
        coverWebpUrl: post.coverWebpUrl,
        coverAlt: post.coverAlt,
      }}
    />
  );
}
