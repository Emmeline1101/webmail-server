// 这个文件处理与IMAP服务器的交互,用于接收邮件。它定义了几个接口和一个Worker类:
const ImapClient = require("emailjs-imap-client");
import { ParsedMail } from "mailparser";
import { simpleParser } from "mailparser";
import { IServerInfo } from "./ServerInfo";
//ICallOptions: 定义了IMAP操作的选项,包括邮箱和消息ID。
export interface ICallOptions {
  mailbox: string;
  id?: number;
}
//IMessage: 表示一封邮件,包含ID、日期、发件人、主题和正文
export interface IMessage {
  id: string;
  date: string;
  from: string;
  subject: string;
  body?: string;
}
//IMailbox: 表示一个邮箱,包含名称和路径。
export interface IMailbox {
  name: string;
  path: string;
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //skip TLS
//Worker: 一个包含多个方法的类,用于连接到IMAP服务器,列出邮箱,获取邮件等
export class Worker {
  private static serverInfo: IServerInfo;
  constructor(inServerInfo: IServerInfo) {
    Worker.serverInfo = inServerInfo;
  }

  private async connectToServer(): Promise<any> {
    const client: any = new ImapClient.default(
      Worker.serverInfo.imap.host,
      Worker.serverInfo.imap.port,
      { auth: Worker.serverInfo.imap.auth }
    );
    client.logLevel = client.LOG_LEVEL_NONE;
    client.onerror = (inError: Error) => {
      console.log("IMAP.Worker.listMailboxes(): Connection error", inError);
    };
    await client.connect();
    return client;
  }

  public async listMailboxes(): Promise<IMailbox[]> {
    const client: any = await this.connectToServer();
    const mailboxes: any = await client.listMailboxes();
    await client.close();
    const finalMailboxes: IMailbox[] = [];
    const iterateChildren: Function = (inArray: any[]): void => {
      inArray.forEach((inValue: any) => {
        finalMailboxes.push({ name: inValue.name, path: inValue.path });
        iterateChildren(inValue.children);
      });
    };
    iterateChildren(mailboxes.children);
    return finalMailboxes;
  }

  public async listMessages(inCallOptions: ICallOptions): Promise<IMessage[]> {
    const client: any = await this.connectToServer();
    const mailbox: any = await client.selectMailbox(inCallOptions.mailbox);
    if (mailbox.exists === 0) {
      await client.close(); // connection isn’t needed any longer
      return [];
    }
    const messages: any[] = await client.listMessages(
      inCallOptions.mailbox,
      "1:*", // messages beginning with the first one and all messages after it
      ["uid", "envelope"] // the unique ID of the message and the metadata about it, called the envelope
    );
    await client.close();
    const finalMessages: IMessage[] = [];
    messages.forEach((inValue: any) => {
      finalMessages.push({
        id: inValue.uid,
        date: inValue.envelope.date,
        from: inValue.envelope.from[0].address,
        subject: inValue.envelope.subject,
      });
    });
    return finalMessages;
  }

  public async getMessageBody(
    inCallOptions: ICallOptions
  ): Promise<string | void> {
    const client: any = await this.connectToServer();
    const messages: any[] = await client.listMessages(
      inCallOptions.mailbox,
      inCallOptions.id,
      ["body[]"],
      { byUid: true }
    );
    const parsed: ParsedMail = await simpleParser(messages[0]["body[]"]);
    await client.close();
    return parsed.text;
  }

  public async deleteMessage(inCallOptions: ICallOptions): Promise<any> {
    const client: any = await this.connectToServer();
    await client.deleteMessages(inCallOptions.mailbox, inCallOptions.id, {
      byUid: true,
    });
    await client.close();
  }
}
