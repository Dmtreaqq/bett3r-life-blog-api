import { app } from "./app";
import { CONFIG } from "./config/config";

app.listen(CONFIG.PORT, () => {
    console.log("App listening on port ", CONFIG.PORT);
})

