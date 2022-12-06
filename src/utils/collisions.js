export const rectsOverlap = (x1, y1, with1, height1, x2, y2, with2, height2) => {
  return x1 < x2 + with2 && x1 + with1 > x2 && y1 < y2 + height2 && y1 + height1 > y2
}
