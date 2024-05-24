# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `remix build`

- `build/server`
- `build/client`

# 学习笔记
## 程序的入口文件与路由的结合
### 基础代码
- 入口文件是 root.tsx 或者 root.jsx， 取决于使用Javascript还是TypeScript
- 入口文件的内容就是 <html> ... </html> 的页面模版
- 可以通过 import type { LinksFunction } from "@remix-run/node"; 的 LinksFunction 模块来添加自己撰写的css文件

### 链接和对应的路由文件
- 在前端页面代码中, 可以通过 Link 或者 NavLink 来生成可以点击的跳转
    - Link是普通的a标签，服务器端的跳转
    - NavLink是浏览器的跳转，不需要服务器的参与. 英文叫 Client Side Routing
- 服务器的处理程序都放在 app/routes 目录中，其结构与命名的要求参照 https://remix.run/docs/en/main/file-conventions/routes
    - 例如 `app/routes/contacts.\$contactId.tsx` 文件，响应的URI是 `/contacts/1234`. 可以理解为查看contact详情的action
    - 例如 `app/routes/contacts.$contactId_.edit.tsx` 文件, 响应的uri是 `/contacts/123/edit`. 可以理解为 编辑和修改 contact的action
    - 例如 `app/routes/contacts.$contactId_.delete.tsx` 文件, 响应的uri是 `/contacts/123/delete`. 可以理解为删除 contact的action

- 通过导入并使用 `@remix-run/react` 的 `Outlet` 模块，实现路由的动态插入和替换，相当于 vue 里面的 router-view 组件的功能
    - 查看 `root.tsx` 文件 196行的代码的实例。 英文叫 Nested Routes

### 数据的加载 Loader
- 在本例子中 root.tsx 文件， 相当月代表了 contacts， 也就是需要加载所有 contacts 并列表显示的地方
- 因此在 roots.tsx 文件中，通过 `loader` + `useLoaderData` 这两个模块，实现数据的加载
- 真正的数据加载，比如从数据库，或者调用某个远端服务API，是通过 `app/data.ts` 来具体实现的，可以理解它是DAO，提供了真正的对数据源的CRUD功能
- 在 root.tsx 文件中, 通过导入DAO (本例为 import data.ts 暴露的某些方法)， 并通过 loader 实现了数据加载
````
import { json } from "@remix-run/node";  // 使用node原生的 json 库
import { useLoaderData, } from "@remix-run/react"; 
import { getContacts } from "./data"; // 引入DAO提供的获取contacts数据集合的 getContacts 接口

// loader 方法会被Remix自动的执行，从而实现contacts数据即可的加载
export const loader = async () => {
  const contacts = await getContacts();
  return json({ contacts });
};

export default function App() {

    // 相当于注入的页面中，理解为 props? 可以直接使用了
    const { contacts } = useLoaderData<typeof loader>(); // <typeof loader>是TS要求的annotation

    // ... 其他代码

    // 直接使用，进行迭代输出到页面
    {
        contacts.map( (contact) => {
            <p key={contact.id}>
                <Link to={`contacts/${contact.id}`}>
                    <>
                        { contact.firstName } { contact.lastName }
                    </>
                </Link>
            </p>
        } )
    }
}
````

