import React from "react";
import { MDXProvider } from "@mdx-js/react";
import Layout from "../components/layout";
import Highlight from "react-highlight.js";
import "../styles/dracula.highlight.js.css"

export default ({ children }) => (
	<Layout>
		<div className="h-24"></div>
		<div className="mx-auto max-w-xl px-2 md:max-w-screen-md">
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
							className="text-left py-3 px-4 uppercase font-semibold text-sm font-semibold"
						/>
					),

					tbody: (props) => <tbody {...props} className="text-gray-700" />,

					tr: (props) => <tr {...props} className="even:bg-gray-100" />,

					td: (props) => <td {...props} className="py-3 px-4" />,

					img: (props) => (
						<>
							<div className="h-4"></div>
							<img {...props} className="shadow rounded min-w-full" />
							<div className="h-4"></div>
						</>
					),

					p: (props) => <p {...props} className="mb-6" />,

					h1: (props) => (
						<>
							<h1
								{...props}
								className="font-bold text-4xl text-teal-400 tracking-wide"
							/>
							<div className="h-4"></div>
						</>
					),
					h2: (props) => (
						<>
							<div className="h-4"></div>
							<h2
								{...props}
								className="font-semibold text-2xl text-teal-400 tracking-wide"
							/>
							<div className="h-2"></div>
						</>
					),
					h3: (props) => (
						<>
							<div className="h-3"></div>
							<h3
								{...props}
								className="font-semibold text-xl text-teal-400 tracking-wide"
							/>
							<div className="h-1"></div>
						</>
					),
					h4: (props) => (
						<>
							<div className="h-2"></div>
							<h4
								{...props}
								className="font-semibold text-teal-400 tracking-wide"
							/>
							<div className="h-1"></div>
						</>
					),
					h5: (props) => (
						<>
							<div className="h-1"></div>
							<h5 {...props} className="font text-teal-400 tracking-wide" />
							<div className="h-0"></div>
						</>
					),
					h6: (props) => (
						<>
							<div className="h-0"></div>
							<h6
								{...props}
								className="font text-teal-400 text-sm tracking-wide"
							/>
							<div className="h-0"></div>
						</>
					),

					a: (props) => (
						<a
							{...props}
							className="inline-block border-b border-dotted border-teal-400 hover:text-teal-400"
						/>
					),

					inlineCode: (props) => (
						<code
							{...props}
							className="bg-gray-200 px-1 py-1 rounded font-mono text-gray-800"
						/>
					),

					pre: (props) => (
						<>
							<div className="h-4"></div>
							<Highlight language={props.children.props.className}>
								{props.children.props.children}
							</Highlight>
							<div className="h-4"></div>
						</>
					),


					blockquote: (props) => (
						<>
							<div className="border-l-8 border-teal-400 pl-4 italic">
								<blockquote {...props} className="text-gray-800" />
							</div>
						</>
					),
				}}
			>
				{children}
			</MDXProvider>
		</div>
		<div className="h-24"></div>
	</Layout>
);
