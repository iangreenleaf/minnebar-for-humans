export const toObject = (iterable, attrToKey) => {
  return Object.fromEntries(
    iterable.map(item => [item[attrToKey], item])
  );
};
