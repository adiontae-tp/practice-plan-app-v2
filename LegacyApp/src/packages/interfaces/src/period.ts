import { DocumentReference } from "firebase/firestore";
import { Tag } from "./tag";

export interface Period {
  id: string;
  name: string;
  duration: number;
  notes: string;
  added: boolean;
  col: string;
  tags: string[];
  ref: DocumentReference;
}
