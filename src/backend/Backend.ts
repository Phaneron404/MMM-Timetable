import * as NodeHelper from "node_helper";
import * as Log from "logger";
import * as fs from "fs";
import { parse } from "csv-parse";
import { Cell, Row } from "../types/Config";

module.exports = NodeHelper.create({
  readCSVFile(filePath: string): Promise<Row[]> {
    return new Promise((resolve, reject) => {
      const rows: Row[] = [];
      fs.createReadStream(filePath)
        .pipe(parse())
        .on("data", (row: any) => {
          const cells: Cell[] = [];
          row.forEach((field, index) => {
            if (field.includes("\\n")) {
              row[index] = field.split("\\n").map((item) => item.trim());
            } else {
              row[index] = [field];
            }
            cells.push({ texts: row[index] });
          });

          rows.push({ cells: cells });
          Log.log(rows);
        })
        .on("end", () => {
          this.sendSocketNotification("CSV_DATA", rows);
        })
        .on("error", (error: Error) => {
          Log.log("Error reading CSV file:", error);
        });
    });
  },

  start() {
    Log.log(`${this.name} Backend started...`);
  },

  async socketNotificationReceived(notification, payload) {
    if (notification === "READ_CSV") {
      this.readCSVFile(payload.filePath);
    }
  }
});
