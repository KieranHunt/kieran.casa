import { EmailSignup } from "./EmailSignup";

export const Post = ({ children, meta }) => {
  const { title, publishDate } = meta;

  return (
    <div className="mt-16 font-source-code-pro">
      <time className="block text-center">{publishDate}</time>
      <h1 className="text-4xl font-bold tracking-wide text-center">{title}</h1>
      <article className="container px-4 mx-auto my-16 prose">
        {children}
      </article>
      {/* <EmailSignup /> */}
    </div>
  );
};
