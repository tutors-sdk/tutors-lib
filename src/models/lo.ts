import { Properties } from '../utils/properties';
import * as path from 'path';
import { getHeader, getImageFile, getParentFolder, readYaml, withoutHeader } from '../utils/futils';
import * as fs from 'fs';
import { readVideoIds, VideoIdentifiers } from '../utils/videoutils';

export abstract class LearningObject {
  parent?: LearningObject;
  course?: LearningObject;
  lotype: string;
  title?: string;
  img?: string;
  videoid?: string;
  videoids?: VideoIdentifiers;
  link?: string;
  folder?: string;
  parentFolder?: string;
  objectivesMd?: string;
  objectives?: string;
  hide = false;
  properties?: Properties;

  protected constructor(parent?: LearningObject) {
    if (parent) {
      this.parent = parent;
    }
    this.lotype = 'lo';
  }

  reap(pattern: string): void {
    this.folder = path.basename(process.cwd());
    this.parentFolder = getParentFolder();
    this.img = getImageFile(pattern);
    if (fs.existsSync('properties.yaml')) {
      this.properties = readYaml('properties.yaml');
    }
    if (fs.existsSync(pattern + '.md')) {
      this.title = getHeader(pattern + '.md');
      this.title = this.title + ' ';

      this.objectivesMd = withoutHeader(pattern + '.md');
    } else {
      this.title = pattern;
    }
    this.videoids = readVideoIds();
    this.videoid = this.videoids.videoid;
  }

  abstract publish(path: string): void;
}
