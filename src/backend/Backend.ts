import * as NodeHelper from "node_helper";
import * as Log from "logger";
import * as fs from "fs";
import { parse } from "csv-parse";
import { Cell, Row } from "../types/Config";
import mqtt, { MqttClient, IClientOptions } from "mqtt";

module.exports = NodeHelper.create({
  mqttClient: null as MqttClient | null,

  start() {
    Log.log(`${this.name} Backend started...`);
  },

  /**
   * Baut die Verbindung zum MQTT-Broker auf und abonniert das angegebene Topic.
   */
  _connectToMqtt({
    brokerUrl,
    options,
    topic
  }: {
    brokerUrl: string;
    options: IClientOptions;
    topic: string;
  }) {
    Log.log(`[${this.name}] Versuche Verbindung zu MQTT-Broker ${brokerUrl}…`);
    this.mqttClient = mqtt.connect(brokerUrl, options);

    this.mqttClient.on("connect", () => {
      Log.log(`[${this.name}] Mit MQTT verbunden, abonniere Topic '${topic}'`);
      this.mqttClient.subscribe(topic, (err) => {
        if (err) {
          Log.error(`[${this.name}] MQTT subscribe error:`, err);
        }
      });
    });

    this.mqttClient.on("message", (topic, message) => {
      try {
        const mqttData: string = JSON.parse(message.toString());
        Log.log(`[${this.name}] MQTT-Nachricht auf '${topic}':`, mqttData);
        this.sendSocketNotification("MQTT_DATA", mqttData);
      } catch (e) {
        Log.error(`[${this.name}] Ungültiges MQTT-Payload:`, e);
      }
    });

    this.mqttClient.on("error", (err) => {
      Log.error(`[${this.name}] MQTT-Fehler:`, err);
    });
  },

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

  /**
   * Dispatch für eingehende Socket-Notifications aus dem Frontend (module.js).
   */
  socketNotificationReceived(notification: string, payload: any) {
    switch (notification) {
      case "READ_CSV":
        this.readCSVFile(payload.filePath);
        break;

      case "CONNECT_MQTT":
        // payload sollte { brokerUrl, options, topic } sein
        this._connectToMqtt(payload);
        break;

      default:
        Log.warn(`[${this.name}] Unbekannte Notification: ${notification}`);
    }
  }
});
