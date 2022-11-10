import { Router } from "express";
import artistRouter from "./artistsOpers/artists.router";

const routes = [{ path: "/artists", route: artistRouter }];

export default routes;
