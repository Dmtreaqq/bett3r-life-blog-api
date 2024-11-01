import { runDB } from "./common/db/db";
import { app } from "./app";
import { CONFIG } from "./common/utils/config";

const startApp = async () => {
  await runDB();

  app.listen(CONFIG.PORT, () => {
    console.log("App listening on port ", CONFIG.PORT);
  });
};

startApp();
