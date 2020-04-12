import React from "react";
import "../styles/tailwind.css";

export default ({ children }) => (
	<>
		<div className="flex flex-col min-h-screen font-sans text-base antialiased bg-gray">
			<header className="bg-teal-400 h-2"></header>
			<div className="flex-grow">{children}</div>
			<footer className="bg-gray-100 h-10"></footer>
		</div>
		<script>
			var clicky_site_ids = clicky_site_ids || [];
			clicky_site_ids.push(101246260);
		</script>
		<script async src="//static.getclicky.com/js"></script>
		<noscript>
			<p>
				<img
					alt="Clicky"
					width="1"
					height="1"
					src="//in.getclicky.com/101246260ns.gif"
				/>
			</p>
		</noscript>
	</>
);
