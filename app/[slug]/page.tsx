import { notFound } from "next/navigation";
import { remark } from "remark";
import html from "remark-html";
import { join } from "path";
import fs from "fs";
import matter from "gray-matter";

type Author = {
  name: string;
  picture: string;
};

type Post = {
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  author: Author;
  excerpt: string;
  ogImage: {
    url: string;
  };
  content: string;
  preview?: boolean;
};

async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

function getPostBySlug(slug: string) {
  const realSlug = slug.replace(/\.md$/, "");
  const postsDirectory = join(process.cwd(), "_posts");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return { ...data, slug: realSlug, content } as Post;
}

type Params = {
  params: {
    slug: string;
  };
};

export default async function Post({ params }: Params) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <main>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </main>
  );
}
