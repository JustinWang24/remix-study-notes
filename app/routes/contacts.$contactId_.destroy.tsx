// 根据remix的规范， 这个文件将是用来响应URL为 /contacts/123/destroy 请求 的路由处理文件

import type { 
    ActionFunctionArgs, 
} from "@remix-run/node";

import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteContact } from "~/data";

export const action = async ({
    params,
}: ActionFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
    await deleteContact(params.contactId);
    return redirect(`/`);
}