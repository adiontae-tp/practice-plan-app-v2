import { DocumentReference } from "firebase/firestore";
import { Activity } from "./activity";
import { Tag } from "./tag";

export interface Template {
	id: string;
	ref: DocumentReference;
	name: string;
	duration: any	;
	col: string;
	activities: Activity[];
	tags: DocumentReference[] | Tag[];
}
