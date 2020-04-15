import React from "react";
import Layout from "../components/layout";
import Tempurature from "../components/tempurature";

const recentPosts = [
	// {
	// 	title: "🔬 Kotlin Scope Functions",
	// 	link: "/kotlin-scope-functions/",
	// 	description:
	// 		"Dive deep into Kotlin's scope functions and eliminate those pesky temporary variables.",
	// 	publishedDate: new Date("2020-04-12"),
	// },
	{
		title: "📰 South African News",
		link: "https://southafricanne.ws/",
		description:
			"Ad-free news from South Africa. Served using just S3 and a CloudFlare Worker.",
	},
	{
		title: "🔒 https-gate",
		link: "https://https-gate.com/",
		description:
			"The n-gate.com website posts hilarious weekly summaries of the top hacker news posts. The author of the site is also also notoriously against serving his site using with TLS. As a joke, I purchased the https-gate domain and proxy requests through to n-gate.",
		isDefunct: true,
	},
	{
		title: "💀 Dead Wikipedia",
		link: "https://twitter.com/dead_wikipedia",
		description:
			"Wikipedia loves lists and so do I. One of the most frequently updated articles is the 'Deaths in <current year/>'. This bot, using IFTTT, posts the name of the person as they are added to the list.",
	},
	{
		title: "📝 Auto CV",
		link: "https://kieran.casa/autocv/",
		description:
			"I was inspired by a Tweet from @TechnicallyRon wherein he made a CV (or résumé) by letting Google autocomplete finish his sentences. I took this one step further by regenerating the CV every day.",
		isDefunct: true,
	},
	{
		title: "👕 Vote for Kieran",
		link: "https://voteforkieran.xyz/",
		description:
			"I made this website to experiment with tailwindcss. So far it has been a fantastic library and I've been able to produce some really good looking sites.",
	},
	{
		title: "📹 YouTubeHaiku 👉 Twitter",
		link: "https://twitter.com/rYouTubeHaiku",
		description:
			"Posting YouTube links to Twitter is not a fantastic experience. On mobile, Twitter clients tend to leave the Twitter app in order play the video. They'll either leave the app entirely, by sending the users to the YouTube app, or they'll show the video in browser view. This bot fixes that. This bot takes the latest hot posts from the /r/youtubehaiku subreddit and posts them to @rYouTubeHaiku as native Twitter videos. This allows users to view the videos without leaving their clients. The bot is written in NodeJS and runs in on AWS Lambda.",
		isDefunct: true,
	},
];

export default () => (
	<Layout>
		<div className="h-24"></div>
		<div className="flex justify-between">
			<div></div>
			<div>
				<div className="w-100 flex items-center justify-between">
					<div></div>
					<img
						className="w-40 h-40 rounded-full bg-teal-400 p-1 shadow-lg"
						src="https://via.placeholder.com/150"
						alt="Yours truly."
					/>
					<div></div>
				</div>
				<h2 className="font-extrabold text-5xl tracking-wide text-center">
					Kieran Hunt
				</h2>
				<p className="text-center text-gray-600 text-sm">Tinkerer of things</p>
				<p className="text-center text-gray-600 text-sm">
					⛰ Cape Town, South Africa 🇿🇦
				</p>
				<p className="text-center text-gray-600 text-sm h-4">
					<Tempurature />
				</p>
			</div>
			<div></div>
		</div>
		<div className="h-24"></div>
		<div className="mx-auto max-w-xl px-2 md:max-w-screen-md">
			{recentPosts.map((post) => postItem({ post }))}
		</div>
		<div className="h-24"></div>
	</Layout>
);

const postItem = ({ post }) => {
	const publishedDate = () => {
		if (post.publishedDate === undefined) {
			return <></>;
		}
		return (
			<p className="text-sm text-gray-600 font-semibold">
				{post.publishedDate.getUTCFullYear()} /{" "}
				{post.publishedDate.getUTCMonth() + 1} /{" "}
				{post.publishedDate.getUTCDate()}
			</p>
		);
	};

	const title = () => {
		if (post.isDefunct === undefined || !post.isDefunct) {
			return (
				<h2 className="font-semibold text-xl text-teal-400 hover:text-teal-900 tracking-wide">
					<a href={post.link}>{post.title}</a>
				</h2>
			);
		}

		return (
			<h2 className="font-semibold text-xl text-teal-400 hover:text-teal-900 tracking-wide line-through">
				<a href={post.link}>{post.title}</a>
			</h2>
		);
	};

	return (
		<div>
			{title()}
			<div className="h-4"></div>
			<p>{post.description}</p>
			{publishedDate()}
			<div className="h-4"></div>
		</div>
	);
};
