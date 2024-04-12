import * as path from "path";
import Nedb from "nedb";
const Datastore = require("nedb");

export interface IContact {
  _id?: number;
  name: string;
  email: string;
}

export class Worker {
  private db: Nedb;
  constructor() {
    this.db = new Datastore({
      filename: path.join(__dirname, "contacts.db"),
      autoload: true,
    });
  }

  public listContacts(): Promise<IContact[]> {
    return new Promise((inResolve, inReject) => {
      this.db.find({}, (inError: Error, inDocs: IContact[]) => {
        if (inError) {
          inReject(inError);
        } else {
          inResolve(inDocs);
        }
      });
    });
  }

  public addContact(inContact: IContact): Promise<IContact> {
    return new Promise((inResolve, inReject) => {
      this.db.insert(inContact, (inError: Error | null, inNewDoc: IContact) => {
        if (inError) {
          inReject(inError);
        } else {
          inResolve(inNewDoc);
        }
      });
    });
  }

  public deleteContact(inID: string): Promise<string | void> {
    return new Promise((inResolve, inReject) => {
      this.db.remove(
        { _id: inID },
        {},
        (inError: Error | null, inNumRemoved: number) => {
          if (inError) {
            inReject(inError);
          } else {
            inResolve();
          }
        }
      );
    });
  }

  public updateContact(contact: IContact): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.update(
        { _id: contact._id },
        contact,
        {},
        (error: Error | null, numberOfUpdated: number) => {
          if (error) {
            reject(error);
          } else {
            resolve(numberOfUpdated);
          }
        }
      );
    });
  }
}
