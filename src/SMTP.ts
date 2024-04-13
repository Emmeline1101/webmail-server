import Mail from "nodemailer/lib/mailer";
import * as nodemailer from "nodemailer";
import { SendMailOptions, SentMessageInfo } from "nodemailer";
import { IServerInfo } from "./ServerInfo";
/*
包含一个 sendMessage 方法，该方法可以发送电子邮件。它使用 nodemailer 库来创建一个传输器，并使用静态属性 serverInfo.smtp 作为配置选项。当调用 sendMessage 方法
*/
export class Worker {
  private static serverInfo: IServerInfo;
  constructor(inServerInfo: IServerInfo) {
    Worker.serverInfo = inServerInfo;
  }
  public sendMessage(inOptions: SendMailOptions): Promise<string | void> {
    return new Promise((inResolve, inReject) => {
      const transport: Mail = nodemailer.createTransport(
        Worker.serverInfo.smtp
      );
      transport.sendMail(
        inOptions,
        (inError: Error | null, inInfo: SentMessageInfo) => {
          if (inError) {
            inReject(inError);
          } else {
            inResolve();
          }
        }
      );
    });
  }
}
