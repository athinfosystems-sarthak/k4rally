const log4js = require("log4js");
const server = require("./app/server");
const { PORT } = require("./config/envs");
const conf = require("./config/logConfig");
const { startSchedulers } = require("./job_queue/add_queue");
const { startWorker } = require("./job_queue/process_worker");

log4js.configure(conf);
server.listen(PORT, async () => {
  log4js.getLogger("index").log(`server started at port ${PORT}`);
  startSchedulers();
  startWorker();
});
