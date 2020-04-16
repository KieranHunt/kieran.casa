const path = require("path");

module.exports = {
	plugins: [
		`gatsby-plugin-postcss`,
		`gatsby-plugin-mdx`,
		{
			resolve: `gatsby-plugin-purgecss`,
			options: {
				printRejected: true,
				tailwind: true,
				whitelist: [""],
				content: [
					path.join(process.cwd(), "src/**/!(*.d).{ts,js,jsx,tsx,css}"),
				],
			},
		},
	],
};
