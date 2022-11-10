import express from "express";
import routes from "./routes";

class App {
  public server;

  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    routes.forEach((route) => this.server.use(route.path, route.route));
  }
}

export default new App().server;
