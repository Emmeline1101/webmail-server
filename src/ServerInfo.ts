//这个文件的作用是集中管理服务器的配置信息,使其他部分的代码可以轻松访问这些配置。
//定义了服务器的配置信息。它包含两个接口
const path = require("path");
const fs = require("fs");
//IServerInfo: 定义了服务器的SMTP和IMAP配置,包括主机、端口和认证信息。
//IMAP允许用户读取邮件,而SMTP允许用户发送邮件。
export interface IServerInfo {
  smtp: {
    host: string;
    port: number;
    auth: { user: string; pass: string };
  };
  imap: {
    host: string;
    port: number;
    auth: { user: string; pass: string };
  };
}
//serverInfo: 一个全局变量,从一个JSON文件(serverInfo.json)中读取实际的服务器配置。
export let serverInfo: IServerInfo;
const rawInfo: string = fs.readFileSync(
  path.join(__dirname, "../serverInfo.json")
);
//使用 JSON.parse 将 rawInfo 中的 JSON 字符串解析为 JavaScript 对象, 并将解析结果赋值给 serverInfo 变量。
serverInfo = JSON.parse(rawInfo);
