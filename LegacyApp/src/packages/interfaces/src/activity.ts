import { DocumentReference } from "firebase/firestore";
import { Tag } from "./tag";

export interface Activity {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  notes: string;
  tags: DocumentReference[] | Tag[];
}
