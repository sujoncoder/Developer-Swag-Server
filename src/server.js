import app from "./app.js"
import { port } from "./secret.js";

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
});





