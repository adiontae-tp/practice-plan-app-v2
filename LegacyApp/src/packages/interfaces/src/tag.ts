import { DocumentReference } from "firebase/firestore";

export interface Tag {
	id: string;
	ref: DocumentReference;
	name: string;
	path: string;
	col: string	;
}
