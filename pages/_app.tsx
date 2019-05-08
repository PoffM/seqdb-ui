import App, { Container } from "next/app";
import React from "react";
import { ApiClientContext, createContextValue } from "../components";

/**
 * App component that wraps every page component.
 *
 * See: https://github.com/zeit/next.js/#custom-app
 */
export default class SeqdbUiApp extends App {
  private hasMounted = false;

  public componentDidMount() {
    this.hasMounted = true;

    // Reload the page after the App is mounted in the browser, because Next.js does not pass in
    // the URL query string on the initial browser-side render.
    // https://github.com/zeit/next.js/issues/2910
    this.props.router.push(this.props.router.asPath);
  }

  public render() {
    const { Component, pageProps } = this.props;

    const contextValue = createContextValue();

    return (
      // Render nothing on the first browser render to avoid passing an empty query string to
      // the page component.
      !this.isFirstBrowserRender() && (
        <ApiClientContext.Provider value={contextValue}>
          <Container>
            <Component {...pageProps} />
          </Container>
        </ApiClientContext.Provider>
      )
    );
  }

  private isFirstBrowserRender() {
    const isRunningInBrowser = typeof window !== "undefined";
    return isRunningInBrowser && !this.hasMounted;
  }
}
