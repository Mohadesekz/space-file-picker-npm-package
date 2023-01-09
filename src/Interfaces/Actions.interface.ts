import { Constants } from './Constants';
import { IUser } from './User.interface';

export interface IA_GetMe {
  type: Constants.GET_ME;
  onEnd: (userInfo: IUser | 'ERROR') => void;
}
