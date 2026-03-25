import app from "./src/app.js"
import mongoose from "mongoose"
import ConnectToDB from "./src/config/database.js"
ConnectToDB()
app.listen(3000,()=>{
    console.log("server running on port 3000")
})
