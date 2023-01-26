export function removeDuplicates(arr: any[]) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

export function removeDuplicatesObjects(objectsList: object[]) {
    return objectsList.filter((value: any, index: number, self: any) => index === self.findIndex((t: any) => t.place === value.place && t.name === value.name));
}
