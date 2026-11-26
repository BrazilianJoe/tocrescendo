import { revalidatePath } from "next/cache";

type RevalidatablePost = { slug: string };

export function revalidatePostPages(
  post: RevalidatablePost,
  previousSlug?: string,
): void {
  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  if (previousSlug && previousSlug !== post.slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
  revalidatePath("/sitemap.xml");
}
