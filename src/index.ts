import { runDB } from "./repositories/db";

require('dotenv').config({ path: '.env.local' })
import { app } from "./app";
import { CONFIG } from "./utils/config";

const startApp = async () => {
    await runDB();

    app.listen(CONFIG.PORT, () => {
        console.log("App listening on port ", CONFIG.PORT);
    })
}

startApp();

