import { StateCreator } from 'zustand';

export interface ProfileUISlice {
  profileIsEditing: boolean;
  profileFormFname: string;
  profileFormLname: string;
  profileIsLoading: boolean;
  profileIsSaving: boolean;

  setProfileIsEditing: (editing: boolean) => void;
  setProfileFormFname: (fname: string) => void;
  setProfileFormLname: (lname: string) => void;
  setProfileIsLoading: (loading: boolean) => void;
  setProfileIsSaving: (saving: boolean) => void;
  resetProfileUI: () => void;
}

const initialState = {
  profileIsEditing: false,
  profileFormFname: '',
  profileFormLname: '',
  profileIsLoading: false,
  profileIsSaving: false,
};

export const createProfileUISlice: StateCreator<ProfileUISlice> = (set) => ({
  ...initialState,

  setProfileIsEditing: (editing) => set({ profileIsEditing: editing }),
  setProfileFormFname: (fname) => set({ profileFormFname: fname }),
  setProfileFormLname: (lname) => set({ profileFormLname: lname }),
  setProfileIsLoading: (loading) => set({ profileIsLoading: loading }),
  setProfileIsSaving: (saving) => set({ profileIsSaving: saving }),
  resetProfileUI: () => set(initialState),
});
