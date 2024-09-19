"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const config_1 = require("./utils/config");
app_1.app.listen(config_1.CONFIG.PORT, () => {
    console.log("App listening on port ", config_1.CONFIG.PORT);
});
