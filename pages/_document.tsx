import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head>
          <title>Kieran Hunt</title>
          <link
            href="https://fonts.googleapis.com/css2?family=Francois+One&family=Nanum+Pen+Script&family=Source+Code+Pro:wght@400;500&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body className="text-xl antialiased text-gray-900">
          <main>
            <Main />
          </main>
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
