import { LearningObject } from './lo';
import { Properties } from '../utils/properties';
import { findLos, publishLos, reapLos } from '../utils/loutils';
import * as fs from 'fs';
import { copyFileToFolder, getCurrentDirectory, readEnrollment, writeFile } from '../utils/futils';
import { Topic } from './topic';
const version = require('../../package.json').version;

interface LoWall {
  course: Course;
  isWall: boolean;
  los: Array<LearningObject>;
}

export class Course extends LearningObject {
  enrollment?: Properties;
  los: Array<LearningObject> = [];
  walls: LoWall[] = [];

  insertCourseRef(los: Array<LearningObject>): void {
    los.forEach((lo) => {
      lo.course = this;
      if (lo instanceof Topic) {
        this.insertCourseRef(lo.los);
      }
    });
    this.course = this;
  }

  constructor(parent?: LearningObject) {
    super(parent);

    this.los = reapLos({ parent: this });
    this.lotype = 'course';
    this.reap('course');
    const ignoreList = this.properties!.ignore;
    if (ignoreList) {
      const los = this.los.filter((lo) => ignoreList.indexOf(lo.folder!) >= 0);
      los.forEach((lo) => {
        lo.hide = true;
      });
    }
    this.insertCourseRef(this.los);
    if (fs.existsSync('enrollment.yaml')) {
      this.enrollment = readEnrollment('enrollment.yaml');
      if (this.enrollment) {
        console.log(`Enrolment file detected with ${this.enrollment.students.length} students`);
      }
    }
    this.walls.push({ course: this, isWall: true, los: findLos(this.los, 'talk') });
    this.walls.push({ course: this, isWall: true, los: findLos(this.los, 'lab') });
    this.walls.push({ course: this, isWall: true, los: findLos(this.los, 'video') });
    this.walls.push({ course: this, isWall: true, los: findLos(this.los, 'panelvideo') });
    this.walls.push({ course: this, isWall: true, los: findLos(this.los, 'github') });
    this.walls.push({ course: this, isWall: true, los: findLos(this.los, 'archive') });
  }

  publish(path: string): void {
    console.log(':: ', this.title);
    if (path.charAt(0) !== '/' && path.charAt(1) !== ':') {
      path = getCurrentDirectory() + '/' + path;
    }
    copyFileToFolder(this.img!, path);
    publishLos(path, this.los);
  }
}
