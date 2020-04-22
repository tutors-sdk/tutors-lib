import { LearningObject } from './lo';
import fs from 'fs';
import { copyFolder, getDirectories, getImageFile, initPath, readFile, readWholeFile } from '../utils/futils';
import path from 'path';
import * as sh from 'shelljs';

const glob = require('glob');

export class Chapter {
  title = '';
  shortTitle = '';
  contentMd = '';
  route = '';
}

export class Book extends LearningObject {
  directories: Array<string> = [];
  chapters: Array<Chapter> = [];

  constructor(parent: LearningObject) {
    super(parent);
    this.reap();
    this.link = 'index.html';
    this.lotype = 'lab';
    if (fs.existsSync('videoid')) {
      this.videoid = readFile('videoid');
    }
  }

  reapChapters(mdFiles: Array<string>): Array<Chapter> {
    const chapters: Array<Chapter> = [];
    mdFiles.forEach((chapterName) => {
      const wholeFile = readWholeFile(chapterName);
      let theTitle = wholeFile.substr(0, wholeFile.indexOf('\n'));
      theTitle = theTitle.replace('\r', '');
      const chapter = {
        file: chapterName,
        title: theTitle,
        shortTitle: chapterName.substring(chapterName.indexOf('.') + 1, chapterName.lastIndexOf('.')),
        contentMd: wholeFile,
        route: '',
      };
      chapters.push(chapter);
    });
    return chapters;
  }

  reap(): void {
    let mdFiles = glob.sync('*.md').sort();
    if (mdFiles.length === 0) {
      return;
    }
    const resourceName = path.parse(mdFiles[0]).name;
    super.reap(resourceName);
    this.directories = getDirectories('.');
    this.chapters = this.reapChapters(mdFiles);
    this.title = this.chapters[0].shortTitle;
    this.img = getImageFile('img/main');
  }

  publish(path: string): void {
    sh.cd(this.folder!);
    const labPath = path + '/' + this.folder;
    initPath(labPath);
    this.directories.forEach((directory) => {
      copyFolder(directory, labPath);
    });
    sh.cd('..');
  }

  toJson(url: string, jsonObj: any) {
    super.toJson(url, jsonObj);
    jsonObj.route = `#lab/${url}`;
    jsonObj.los = [];
    this.chapters.forEach((chapter) => {
      let jsonChapter: any = {};
      jsonChapter.title = chapter.title;
      jsonChapter.shortTitle = chapter.shortTitle;
      jsonChapter.contentMd = chapter.contentMd;
      jsonChapter.route = `${jsonObj.route}/${chapter.shortTitle}`;
      jsonObj.los.push(jsonChapter);
    });
  }
}
