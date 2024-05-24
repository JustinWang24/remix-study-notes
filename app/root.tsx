import type { 
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";

import { useEffect } from "react";

import {
  Form,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  /**
   * Since Remix is built on top of React Router, it supports nested routing. In order for child routes to render inside of parent layouts, 
   * we need to render an Outlet in the parent. Let's fix it, open up app/root.tsx and render an outlet inside.
   */
  Outlet,
  /**
   * 无须从新加载的Client side routing链接, 需要用到Link
   */
  Link, NavLink,
  /**
   * There are two APIs we'll be using to load data, loader and useLoaderData. 
   * First we'll create and export a loader function in the root route and then render the data.
   */
  useLoaderData,
  /**
   * Remix is managing all the state behind the scenes and reveals the pieces you need to build 
   * dynamic web apps. In this case, we'll use the useNavigation hook.
   */
  useNavigation,
  /**
   * 
   */
  useSubmit,
} from "@remix-run/react";

import appStylesHref from "./app.css?url";
import { getContacts, createEmptyContact } from "./data";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

/**
 * 这里的action代码是服务器端的响应程序. 对应的 method=get uri=/ 的请求
 */
export const action = async () => {
  const contact = await createEmptyContact();
  // return json({ contact });
  return redirect(`/contacts/${contact.id}/edit`);
}

/**
 * Loader 方法
 * 在搜索表单的提交中, 根据Form的代码，它不是一个post的提交，需要到服务器. Remix emulates the browser by serializing 
 * the FormData into the URLSearchParams instead of the request body.
 * 因此, loader functions have access to the search params from the request. Let's use it to filter the list.
 * Because this is a GET, not a POST, Remix does not call the action function. 
 * Submitting a GET form is the same as clicking a link: only the URL changes.
 * This also means it's a normal page navigation. You can click the back button to get back to where you were.
 * @returns 
 */
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({contacts, q});
}

export default function App() {

  // 这里是放js程序的代码
  const {contacts, q} = useLoaderData<typeof loader>(); // 加载所有的contacts数据

  const navigation = useNavigation(); // 一种state管理的现成库

  const submit = useSubmit(); // 用了实现类似 Ajax 自动更新的功能

  const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");

  /**
   * 下面的代码，回头再研究，并非核心功能
   */
  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form 
              id="search-form" 
              role="search" 
              onChange={ (event) => {
                const isFirstSearch = q === null;
                // submit(event.currentTarget)
                submit(event.currentTarget, { replace: !isFirstSearch})
              } }
            >
              <input
                id="q"
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                defaultValue={q||""}
                className={ searching ? "loading" : "" }
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            {/* 注意这里也是Form，用来做跳转用的。跳转的响应，对应服务器端的程序代码，在上面的action方法中 */}
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      {/* <Link to={`contacts/${contact.id}`}>
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                        )}{" "}
                        {contact.favorite ? (
                          <span>★</span>
                        ) : null}
                      </Link> */}

                        <NavLink
                          className={({ isActive, isPending }) =>
                            isActive
                              ? "active"
                              : isPending
                              ? "pending"
                              : ""
                          }
                          to={`contacts/${contact.id}`}
                        >
                          {contact.first || contact.last ? (
                            <>{contact.first} {contact.last}</>
                          ) : (
                            <i>No Name</i>
                          )}
                          {" "}
                          { contact.favorite ? (
                            <span>*</span>
                          ):null }
                        </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <i>No contacts</i>
                </p>
              )}
            <ul>
              <li>
                <a href={`/contacts/1`}>导致重新加载页面的朋友</a>
              </li>
              <li>
                <Link to={`/contacts/2`}>无须从新加载的Client side routing链接1</Link>
              </li>
              <li>
                <Link to={`/contacts/abc`}>无须从新加载的Client side routing链接2</Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* 
          通过import的Outlet, 对应的路由文件的内容就会被输出到这里，动态的取代 Outlet
        */}
        <div id="detail" className={navigation.state === "loading" && !searching ? "loading" : ""}>
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
