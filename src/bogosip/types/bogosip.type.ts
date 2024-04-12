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
  ADD_DT: { col: 'bogosips.created_at', order: 'ASC' },
  ADD_DT_DESC: { col: 'bogosips.created_at', order: 'DESC' },
  NEW: { col: 'webContent.pub_date', order: 'DESC' },
  OLD: { col: 'webContent.pub_date', order: 'ASC' },
};
