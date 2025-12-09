import { DocumentReference, Timestamp } from "firebase/firestore";

export interface Team {
	ref: DocumentReference;
	id?: string;
	uid?: string;
	name: string;
	sport: string;
	path: string;
	col: string;
	headCoach: DocumentReference;
	primaryColor?: string;
	secondaryColor?: string;
	logoUrl?: string;
	fontUrl?: string;
	fontName?: string;
	created_t?: Timestamp;
	modified_t?: Timestamp;
}
