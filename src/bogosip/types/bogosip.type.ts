export enum BogosipType {
  BOGOSIP = '보고싶어요',
  BONENJUNG = '보는중',
}

export const convertToEnum = (type: string) => {
  if (type === 'wishes') return BogosipType.BOGOSIP;
  else if (type === 'watchings') return BogosipType.BONENJUNG;
  else return null;
};

export const orderType = {
  ADD_DT: { col: 'createdAt', order: 'ASC' },
  ADD_DT_DESC: { col: 'createdAt', order: 'DESC' },
  NEW: { col: 'pubDate', order: 'DESC' },
  OLD: { col: 'pubDate', order: 'ASC' },
};
