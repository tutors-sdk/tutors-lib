import { LearningObject } from './lo';
import { publishLos, reapLos } from '../utils/loutils';
import fs from 'fs';
import * as sh from 'shelljs';
import { copyFileToFolder } from '../utils/futils';

export class Topic extends LearningObject {
  los: Array<LearningObject> = [];
  constructor(parent: LearningObject) {
    super(parent);
    this.los = reapLos({ parent: this });
    this.reap('topic');
    this.link = 'index.html';
    this.lotype = 'topic';
    this.setDefaultImage();
  }

  setDefaultImage(): void {
    if (!this.img && this.los.length > 0) {
      const img = this.los[0].folder!! + '/' + this.los[0].img;
      if (fs.existsSync(img)) {
        this.img = img;
      }
    }
  }

  publish(path: string): void {
    console.log('::', this.title);
    sh.cd(this.folder!);
    const topicPath = path + '/' + this.folder;
    copyFileToFolder(this.img!, topicPath);
    publishLos(topicPath, this.los);
    sh.cd('..');
  }

  toJson(url: string, jsonObj: any) {
    const topicUrl = `${url}${this.folder}`;
    super.toJson(topicUrl, jsonObj);
    jsonObj.route = `#topic/${topicUrl}`;
    jsonObj.los = [];
    this.los.forEach((lo) => {
      let loJson: any = {};
      lo.toJson(`${topicUrl}/${lo.folder}`, loJson);
      jsonObj.los.push(loJson);
    });
  }
}

export class Unit extends Topic {
  constructor(parent: LearningObject) {
    super(parent);
    this.lotype = 'unit';
  }

  // publish(path: string): void {
  //   console.log('::', this.title);
  //   sh.cd(this.folder!);
  //   const topicPath = path + '/' + this.folder;
  //   copyFileToFolder(this.img!, topicPath);
  //   publishLos(topicPath, this.los);
  //   sh.cd('..');
  // }

  toJson(url: string, jsonObj: any) {
    url = url.substring(0, url.lastIndexOf('/')) + '/';
    super.toJson(url, jsonObj);
    jsonObj.route = `#topic/${url}`;
  }
}
