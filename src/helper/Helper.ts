import * as NodeHelper from "node_helper";
import * as Log from "logger";

module.exports = NodeHelper.create({
  start() {
    Log.log(`${this.name} helper method started...`);
  }
});
