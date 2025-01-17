/**
 * Swaps two elements in an array in place
 * @param arr 
 * @param x 
 * @param y 
 */
export const swap = <T>(arr: T[], x: number, y: number) => {
    const left = Math.max(0, Math.min(x, y));
    const right = Math.min(Math.max(x, y), arr.length - 1);

    arr[left] = arr.splice(right, 1, arr[left])[0];
}