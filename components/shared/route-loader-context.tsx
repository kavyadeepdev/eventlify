"use client";

import { createContext, useContext } from "react";

const NavigationLoaderContext = createContext(false);

export const NavigationLoaderProvider = NavigationLoaderContext.Provider;

export function useNavigationLoaderActive() {
  return useContext(NavigationLoaderContext);
}
