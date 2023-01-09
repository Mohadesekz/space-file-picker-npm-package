import { EAutority } from '../enums/App.enums';
import { IUser } from './User.interface';

export interface ITeam {
  created: number;
  description: string;
  folder: string;
  hash: string;
  name: string;
  updated: number;
  members: IMember[];
  owner: IUser;
}

export interface IMember {
  authority: EAutority;
  user: IUser;
}
