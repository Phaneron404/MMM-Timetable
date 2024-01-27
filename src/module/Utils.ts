import { Cell, Config, Row } from "../types/Config";

export default class Utils {
  static getCellType(cellToCheck: Cell, timeTable: Row[], config: Config) {
    let cellType: string = "contentCell";
    if (!this.isEmptyTexts(cellToCheck.texts)) {
      timeTable.forEach((row, rowIndex) => {
        row.cells.forEach((cell, cellIndex) => {
          if (cellToCheck.id === cell.id) {
            if ((config.titleRow !== undefined && config.titleRow.includes(rowIndex)) || (config.titleColumn !== undefined && config.titleColumn.includes(cellIndex))) {
              cellType = "titleCell";
            }
          }
        });
      });
    } else {
      cellType = "emptyCell";
    }

    return cellType;
  }

  static isEmptyTexts(texts: string[]) {
    let result: boolean = true;
    texts.forEach((text) => {
      if (text.trim() !== "") {
        result = false;
      }
    });
    return result;
  }
}
