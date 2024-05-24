/**
 * When a route has children, and you're at the parent route's path, the <Outlet> has nothing to render 
 * because no children match. You can think of index routes as 
 * the default child route to fill in that space.
 */

export default function Index() {
    return (
      <p id="index-page">
        This is a demo for Remix.
        <br />
        Check out{" "}
        <a href="https://remix.run">the docs at remix.run</a>.
      </p>
    );
  }
  