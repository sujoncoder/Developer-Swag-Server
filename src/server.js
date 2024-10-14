import app from "./app.js";
import connectDB from "./config/db.js";
import { port } from "./secret.js";


// APPLICATION LISTENING
app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`)
    await connectDB()
});





