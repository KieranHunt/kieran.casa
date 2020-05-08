import React from "react";
import { MDXProvider } from "@mdx-js/react";
import Layout from "../components/layout";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default ({ children }) => (
  <Layout>
    <div className="h-24"></div>
    <div className="mx-auto max-w-xl px-3 md:px-0 md:max-w-screen-md">
      <MDXProvider
        components={{
          table: (props) => (
            <>
              <div className="shadow rounded overflow-hidden border-b border-gray-200">
                <table {...props} className="min-w-full bg-white" />
              </div>
              <div className="h-4"></div>
            </>
          ),

          thead: (props) => (
            <thead
              {...props}
              className="subpixel-antialiased bg-gray-800 text-white py-3 px-4"
            />
          ),

          th: (props) => (
            <th
              {...props}
              className="text-left py-3 px-1 md:px-4 uppercase font-medium md:font-semibold text-sm"
            />
          ),

          tbody: (props) => <tbody {...props} className="text-gray-700" />,

          tr: (props) => <tr {...props} className="even:bg-gray-100" />,

          td: (props) => <td {...props} className="py-3 px-4" />,

          img: (props) => (
            <>
              <img {...props} className="shadow rounded min-w-full mb-4" />
            </>
          ),

          p: (props) => <p {...props} className="mb-4" />,

          h1: (props) => (
            <>
              <h1
                {...props}
                className="font-bold text-4xl text-teal-400 tracking-wide mb-8"
              />
            </>
          ),
          h2: (props) => (
            <>
              <h2
                {...props}
                className="font-semibold text-2xl text-teal-400 tracking-wide mb-4"
              />
            </>
          ),
          h3: (props) => (
            <>
              <h3
                {...props}
                className="font-semibold text-xl text-teal-400 tracking-wide mb-4"
              />
            </>
          ),
          h4: (props) => (
            <>
              <h4
                {...props}
                className="font-semibold text-teal-400 tracking-wide"
              />
            </>
          ),
          h5: (props) => (
            <>
              <h5 {...props} className="font text-teal-400 tracking-wide" />
            </>
          ),
          h6: (props) => (
            <>
              <h6
                {...props}
                className="font text-teal-400 text-sm tracking-wide"
              />
            </>
          ),

          a: (props) => (
            <a
              {...props}
              className="border-b border-dotted border-teal-400 hover:text-teal-400"
            />
          ),

          inlineCode: (props) => (
            <code
              {...props}
              className="bg-gray-200 px-1 py-1 rounded font-mono text-gray-700 text-sm"
            />
          ),

          pre: (props) => (
            <>
              <SyntaxHighlighter
                language={props.children.props.className}
                style={dracula}
                className="shadow rounded"
              >
                {props.children.props.children}
              </SyntaxHighlighter>
            </>
          ),

          blockquote: (props) => (
            <>
              <div className="border-l-8 border-teal-400 pl-4 italic">
                <blockquote {...props} className="text-gray-800" />
              </div>
            </>
          ),

          ul: (props) => (
            <>
              <ul {...props} className="list-disc list-inside px-4 mb-4" />
            </>
          ),

          ol: (props) => (
            <ul {...props} className="list-decimal list-inside px-4 mb-4" />
          ),

          strong: (props) => (
            <strong
              {...props}
              className="font-bold text-gray-900 tracking-wide"
            />
          ),

          hr: (props) => (
            <div className="grid grid-cols-12 mb-4">
              <div className="col-span-3"></div>
              <div
                {...props}
                className="col-span-6 border-t-2 border-teal-400"
              />
              <div className="col-span-3"></div>
            </div>
          ),
        }}
      >
        {children}
      </MDXProvider>
    </div>
    <div className="h-24"></div>
  </Layout>
);
