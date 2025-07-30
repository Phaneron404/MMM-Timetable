import { Config, Row } from "../types/Config";
import Utils from "./Utils";

Module.register<Config>("MMM-Timetable", {
  displayedTimeTable: [],

  lastIndex: -1,

  activeMqttId: "",

  defaults: {
    srcCSV: "",
    timeTable: [],
    mqttTimeTables: [],
    borderWidth: 5,
    borderColor: "rgb(0, 0, 0)",
    cellColor: "#1E1E20",
    titleCellColor: "#B7410E",
    emptyCellColor: "rgba(0, 0, 0, 0)",
    titleRow: [0],
    titleColumn: [0],
    mqttBrokerUrl: "",
    mqttOptions: {},
    mqttTopic: ""
  },

  start() {
    this._setupMqtt();
    this.setDisplayedTimeTable();
    this.prepareTable();

    //At the moment not needed
    // this.schedulePaginationUpdate();
    // this.loadCSV();
    // this.scheduleReloadCSV();
  },

  _setupMqtt() {
    if (this.config.mqttBrokerUrl && this.config.mqttTopic) {
      this.sendSocketNotification("CONNECT_MQTT", {
        brokerUrl: this.config.mqttBrokerUrl,
        options: this.config.mqttOptions,
        topic: this.config.mqttTopic
      });
    }
  },

  setDisplayedTimeTable() {
    this.displayedTimeTable = [];
    // At the moment Pagination does mot work. Only with mqtt.
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
            if (
              cellCount < this.config.pagination.maxValues &&
              cellIndex > this.lastIndex &&
              !pushed
            ) {
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
      if (
        this.config.mqttTimeTables &&
        this.activeMqttId &&
        this.activeMqttId !== ""
      ) {
        const mqttTimeTable = this.config.mqttTimeTables.find(
          (item) => item.mqttId === this.activeMqttId
        );

        if (mqttTimeTable) {
          if (mqttTimeTable.timeTable) {
            this.displayedTimeTable = mqttTimeTable.timeTable;
          }

          if (mqttTimeTable.csvSrc) {
            this.sendSocketNotification("READ_CSV", {
              filePath: mqttTimeTable.csvSrc
            });
          }
        }
      } else {
        this.displayedTimeTable = this.config.timeTable;
      }
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
    return {
      config: this.config,
      timeTable: this.displayedTimeTable,
      utils: Utils
    };
  },

  schedulePaginationUpdate() {
    if (this.config.pagination !== undefined) {
      setInterval(() => {
        this.updateTimeTable();
      }, this.config.pagination.duration * 1000);
    }
  },

  scheduleReloadCSV() {
    if (this.config.reloadAt !== undefined) {
      setInterval(() => {
        const now = new Date();
        if (
          now.getHours() == this.config.reloadAt.hour &&
          now.getMinutes() == this.config.reloadAt.minute
        ) {
          this.loadCSV();
        }
      }, 60 * 1000);
    }
  },

  loadCSV() {
    if (this.config.srcCSV !== "" && this.config.srcCSV !== undefined) {
      this.sendSocketNotification("READ_CSV", {
        filePath: this.config.srcCSV
      });
    }
  },

  updateTimeTable() {
    this.setDisplayedTimeTable();
    this.prepareTable();
    this.updateDom();
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CSV_DATA") {
      // Handle received CSV data
      this.displayedTimeTable = payload;
      // this.prepareTable();
      // this.updateDom();
    } else if (notification === "MQTT_DATA") {
      this.activeMqttId = payload;
      this.updateTimeTable();
    }
  }
});
