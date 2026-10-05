import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import albumRoutes from "./routes/album.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRoutes);
app.use("/albums", albumRoutes);

app.listen(3001, () => {
  console.log("Servidor rodando em http://localhost:3001");
});