import fs from 'fs';
import listEvents from './listEvents';

const fsPromises = require('fs').promises;
const path = require('path');
const os = require('os');
const git = require('simple-git/promise');
require('dotenv').config();

const MDtextload = fs.readFileSync('./MDtext.md', { encoding: 'utf-8' });
const projectLoad = 'training';
const roomNameLoad = `${projectLoad}-235`;

const gitArchive = {
  user: process.env.GIT_USER,
  password: process.env.GIT_PASSWORD,
  repoPrefix: process.env.GIT_PREFIX,
};
const { user, password, repoPrefix } = gitArchive;
const remote = `https://${user}:${password}@${repoPrefix}`;

const allActions = async (listEventsGit, MDtext, projectGit, roomNameGit) => {
  const tmpPath = await fsPromises.mkdtemp(path.join(os.tmpdir(), 'arhive-'));
  await git(tmpPath).clone(remote);
  const repoPath = `${tmpPath}/${projectGit}`;
  const repoRoomPath = `${repoPath}/${roomNameGit}`;
  const repoRoomResPath = `${repoRoomPath}/res`;
  await fsPromises.mkdir(repoRoomResPath, { recursive: true });

  await fsPromises.writeFile(
    path.join(repoRoomPath, `${roomNameGit}.md`),
    MDtext
  );
  await Promise.all(
    listEventsGit.map(async event => {
      await fsPromises.writeFile(
        path.join(repoRoomResPath, `${event.eventId}.json`),
        JSON.stringify(event)
      );
    })
  );

  await git(repoPath).add('./*');
  await git(repoPath).commit('first commit!');
  await git(repoPath).push('origin', 'master');

  return tmpPath;
};

allActions(listEvents, MDtextload, projectLoad, roomNameLoad)
  .then(pth => console.log(pth))
  .catch(err => console.log(err));
