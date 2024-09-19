"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config({ path: '.env.local' });
const app_1 = require("./app");
const config_1 = require("./utils/config");
app_1.app.listen(config_1.CONFIG.PORT, () => {
    console.log("App listening on port ", config_1.CONFIG.PORT);
});
