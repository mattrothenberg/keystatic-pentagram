import { create } from "zustand";

type SiteStore = {
  disableGlobalTransition: boolean;
  setDisableGlobalTransition: (value: boolean) => void;
};

export const useSiteStore = create<SiteStore>((set) => ({
  disableGlobalTransition: false,
  setDisableGlobalTransition: (value) =>
    set({ disableGlobalTransition: value }),
}));
