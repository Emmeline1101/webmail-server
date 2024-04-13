import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
import { serverInfo } from "./ServerInfo";
import * as IMAP from "./IMAP";
import * as SMTP from "./SMTP";
import * as Contacts from "./contacts";
import { IContact } from "./contacts";
/*
总的来说,这段代码实现了一个简单的电子邮件和联系人管理的Web服务器,提供了相应的API端点来处理各种操作。它使用了Express.js框架、IMAP和SMTP协议,并对电子邮件和联系人数据进行了CRUD(创建、读取、更新和删除)操作。
*/
const app: Express = express();
// add middleware
app.use(express.json()); // json into js
app.use("/", express.static(path.join(__dirname, "../../client/dist"))); //访问根路径的时候找到相应文件
app.use(function (
  inRequest: Request,
  inResponse: Response,
  inNext: NextFunction
) {
  inResponse.header("Access-Control-Allow-Origin", "*");
  inResponse.header("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  inResponse.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept"
  );
  inNext(); //允许跨域请求，通过设置相应的 CORS 头，以便在浏览器中安全地处理来自不同域的请求
});
/*
这部分定义了与IMAP(Internet消息访问协议)相关的API端点,包括获取邮箱列表、获取邮件列表、获取邮件正文内容和删除邮件
*/
// List Mailbox
app.get("/mailboxes", async (inRequest: Request, inResponse: Response) => {
  try {
    const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
    inResponse.json(mailboxes);
  } catch (inError) {
    inResponse.send(`error ${inError}`); // IMAP 服务器获取邮箱列表，然后将该列表作为 JSON 数据发送给客户端
  }
});

//List Message
app.get(
  "/mailboxes/:mailbox",
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const messages: IMAP.IMessage[] = await imapWorker.listMessages({
        mailbox: inRequest.params.mailbox, //访问动态路径参数的值
      });
      inResponse.json(messages);
    } catch (inError) {
      inResponse.send("error");
    }
  }
);

app.get(
  "/messages/:mailbox/:id",
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      const messageBody: string | void = await imapWorker.getMessageBody({
        mailbox: inRequest.params.mailbox,
        id: parseInt(inRequest.params.id, 10), //id 的值通过 parseInt 转换为十进制整数。该方法返回消息的正文，使用 await 等待异步操作完成
      });
      inResponse.send(messageBody);  //request parameters are always string
    } catch (inError) {
      inResponse.send(`error ${inError}`);
    }
  }
);

app.delete(
  "/messages/:mailbox/:id",
  async (inRequest: Request, inResponse: Response) => {
    try {
      const imapWorker: IMAP.Worker = new IMAP.Worker(serverInfo);
      await imapWorker.deleteMessage({
        mailbox: inRequest.params.mailbox,
        id: parseInt(inRequest.params.id, 10),
      });
      inResponse.send("ok");
    } catch (inError) {
      inResponse.send(`error ${inError}`);
    }
  }
);

//send messages
//这部分定义了与SMTP(简单邮件传输协议)相关的API端点,用于发送新邮件。

app.post(
  "/messages",

  async (inRequest: Request, inResponse: Response) => { //inRequest contain all the information we need to send a message
    try {
      const smtpWorker: SMTP.Worker = new SMTP.Worker(serverInfo);
      await smtpWorker.sendMessage(inRequest.body);
      inResponse.status(201).send("ok");
    } catch (inError) {
      inResponse.send(`error ${inError}`);
    }
  }
);
/*
这部分定义了与联系人管理相关的API端点,包括获取联系人列表、添加新联系人、删除联系人和更新联系人信息。
*/
app.get(
  "/contacts",

  async (inRequest: Request, inResponse: Response) => {
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contacts: IContact[] = await contactsWorker.listContacts();
      inResponse.json(contacts);
    } catch (inError) {
      inResponse.send("error");
    }
  }
);

//add contacts
app.post("/contacts", async (inRequest: Request, inResponse: Response) => {
  try {
    const contactsWorker: Contacts.Worker = new Contacts.Worker();
    const contact: IContact = await contactsWorker.addContact(inRequest.body);
    inResponse.status(201).json(contact);
  } catch (inError) {
    inResponse.send("error");
  }
});

app.delete(
  "/contacts/:id",
  async (inRequest: Request, inResponse: Response) => {
    try {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      await contactsWorker.deleteContact(inRequest.params.id);
      inResponse.send("ok");
    } catch (inError) {
      inResponse.send("error");
    }
  }
);

app.put("/contacts", async (request: Request, response: Response) => {
  try {
    const worker: Contacts.Worker = new Contacts.Worker();
    const numberOfContactsUpdated: number = await worker.updateContact(
      request.body
    );
    response.send(`Number of contacts update: ${numberOfContactsUpdated}`);
  } catch (e) {
    response.send(`error ${e}`);
  }
});

app.listen(80, () => {
  console.log("MailBag server open for requests");
});


//执行npx webpack-dev-server --mode development --open
//占领了port:netstat -a -o -n
//          taskkill /f /pid