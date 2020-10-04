import Link from "next/link";

const importAll = (r: __WebpackModuleApi.RequireContext) => {
  return r.keys().map((fileName) => ({
    link: fileName.substr(1).replace(/\/index\.mdx$/, ""),
    ...r(fileName).meta,
  }));
}

const posts = importAll(
  require.context("./", true, /\.mdx$/)
);

const HomePage = () => (
  <ul className="flex flex-col items-center mt-16 text-xl font-source-code-pro">
    {posts.map((post) => (
      <li className="flex items-center">
        <post.icon className="h-6" />
        <Link href={post.link}>{post.title}</Link>
      </li>
    ))}
  </ul>
);

export default HomePage;

