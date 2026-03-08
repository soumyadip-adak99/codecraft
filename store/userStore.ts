import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserState {
    hasApiKey: boolean;
    setHasApiKey: (val: boolean) => void;
    reset: () => void;
}

export const useUserStore = create<UserState>()(
    devtools(
        persist(
            (set) => ({
                hasApiKey: false,
                setHasApiKey: (val) => set({ hasApiKey: val }),
                reset: () => set({ hasApiKey: false }),
            }),
            { name: "codeCraft-user" }
        ),
        { name: "UserStore" }
    )
);
