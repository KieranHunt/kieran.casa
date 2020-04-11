export default (frontMatter) => {
	return ({ children: content }) => {
		return (
			<>
				<style global jsx>{`
					body {
						background-color: #fff;
						color: #1a202c;
						-webkit-font-smoothing: antialiased;
						-moz-osx-font-smoothing: grayscale;
						font-size: 1.1rem;
						border-top-width: 4px;
						border-color: #4fd1c5;
					}

					#__next {
						font-family: system-ui, -apple-system, BlinkMacSystemFont,
							"Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans",
							sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
							"Segoe UI Symbol", "Noto Color Emoji";
					}
					#__next > div {
						margin-right: auto;
						margin-left: auto;
						max-width: 50rem;
					}

					#__next > div > h1 {
						text-align: center;
						font-size: 3rem;
						margin-bottom: 3rem;
						padding-top: 1rem;
						font-weight: 700;
					}

					#__next > div > h2 {
						font-size: 1.5rem;
						font-weight: 500;
						margin-bottom: 1rem;
					}

					#__next > div > p {
						margin-bottom: 1rem;
					}

					#__next > div > p > a {
						color: #319795;
					}

					#__next > div > p > a:hover {
						color: #234e52;
					}

					#__next > div > p > code {
						background-color: #f7fafc;
						color: #4a5568;
						font-size: 1rem;
						font-family: font-family: Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
						padding-right: 0.3rem;
						padding-left: 0.3rem;
						border-radius: 5px;
						display: inline-block;
					}
				`}</style>
				<div>{content}</div>
			</>
		);
	};
};
