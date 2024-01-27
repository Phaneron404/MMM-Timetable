import { Config, Row } from "../types/Config";
import Utils from "./Utils";

Module.register<Config>("MMM-Timetable", {
  displayedTimeTable: [],

  lastIndex: -1,

  defaults: {
    srcCSV: "",
    timeTable: [],
    borderWidth: 5,
    borderColor: "rgba(0, 0, 0, 0)",
    cellColor: "#1E1E20",
    titleCellColor: "#B7410E",
    emptyCellColor: "rgba(0, 0, 0, 0)",
    titleRow: [0],
    titleColumn: [0]
  },

  start() {
    this.setDisplayedTimeTable();
    this.prepareTable();
    this.scheduleUpdate();
  },

  setDisplayedTimeTable() {
    this.displayedTimeTable = [];
    if (this.config.pagination !== undefined) {
      if (this.config.pagination.mode == "column") {
        this.config.timeTable.forEach((row) => {
          const newRow: Row = { cells: [] };
          let cellCount: number = 0;
          row.cells.forEach((cell, cellIndex) => {
            let pushed: boolean = false;
            if (this.config.pagination.keepFirst && cellIndex == 0) {
              newRow.cells.push(cell);
              pushed = true;
              cellCount++;
            }
            if (cellCount < this.config.pagination.maxValues && cellIndex > this.lastIndex && !pushed) {
              newRow.cells.push(cell);
              cellCount++;
            }
          });
          this.displayedTimeTable.push(newRow);
        });
        this.lastIndex = this.lastIndex + this.config.pagination.maxValues;
        if (this.lastIndex >= this.config.timeTable[0].cells.length - 1) {
          this.lastIndex = -1;
        }
      }
    } else {
      this.displayedTimeTable = this.config.timeTable;
    }
  },

  prepareTable() {
    let cellId: number = 0;
    this.displayedTimeTable.forEach((row) => {
      row.cells.forEach((cell) => {
        cell.id = cellId++;
      });
    });
  },

  getTemplate() {
    return "templates/timetable.njk";
  },

  getTemplateData() {
    return { config: this.config, timeTable: this.displayedTimeTable, utils: Utils };
  },

  scheduleUpdate() {
    if (this.config.pagination !== undefined) {
      setInterval(() => {
        this.setDisplayedTimeTable();
        this.prepareTable();
        this.updateDom();
      }, this.config.pagination.duration * 1000);
    }
  }
});
