import React from "react"
import ReactDOM from "react-dom/client"
import "./index.scss"
import { Router, Route, ErrorPage } from "@ioncore/theme/Router"
import { IoncoreProvider } from "@ioncore/theme"
import IoncoreLoader from "./components/IoncoreLoader/IoncoreLoader"
import UserApi from "./Api/UserApi"
import BaseApi from "./Api/BaseApi"
import SettingsProvider from "./components/SettingsProvider/SettingsProvider"

function requirement(opts: {
  admin?: boolean,
  loggedIn?: boolean,
  role?: string,
  permission?: string,
}, route: Route): Route {
  return {
    title: route.title,
    path: route.path,
    component: async (...args) => {
      const user = BaseApi.getUser();
      if (opts.loggedIn) {
        if (!user) {
          return <ErrorPage error={new Error("Not logged in")} statusCode={401} />
        }
      }

      if (opts.admin) {
        if (!user?.isAdmin) {
          return <ErrorPage error={new Error("Not authorized")} statusCode={403} />
        }
      }

      if (opts.role) {
        if (!await UserApi.hasRole(opts.role)) {
          return <ErrorPage error={new Error("Not authorized")} statusCode={403} />
        }
      }

      if (opts.permission) {
        try {
          if (!await UserApi.hasPermission(opts.permission)) {
            return <ErrorPage error={new Error("Not authorized, missing permission")} statusCode={403} />
          }
        } catch (error) {
          return <ErrorPage error={new Error("Not logged in")} statusCode={401} />
        }
      }

      return typeof route.component === "function" ? await route.component(...args) : route.component;
    }
  }
}

const pages: Route[] = [
  {
    path: /^\/$/,
    title: "Toxen",
    component: async () => {
      const HomePage = (await import("./pages/ToxenApp/ToxenApp")).default;
      return <HomePage />
    },
  },
]

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingsProvider>
      <IoncoreProvider theme={{ scheme: "dark" }}>
        <Router pages={pages} loadingPage={() => <IoncoreLoader centered />} errorPage={ErrorPage} />
      </IoncoreProvider>
    </SettingsProvider>
  </React.StrictMode>,
);

