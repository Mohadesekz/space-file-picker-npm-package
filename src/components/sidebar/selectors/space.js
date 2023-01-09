import { Util } from '../../../helpers';

export default res => {
  const percentage = Math.floor((res.storageUsage * 100) / res.storageLimit);
  return {
    total: Util.bytesToSize(res.storageLimit),
    inUse: Util.bytesToSize(res.storageUsage),
    remainSpace: res.storageLimit - res.storageUsage,
    inUsePercentage: percentage,
  };
};
