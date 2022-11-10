export function searchResult(baseObject: any, search: any, property?: string) {
  return baseObject?.find((objElement: any) => {
    if (!!property) {
      return objElement[property] == search;
    } else {
      return objElement == search;
    }
  });
}
