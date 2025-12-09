import { DocumentReference } from "firebase/firestore";
import { Activity } from "./activity";
import { Tag } from "./tag";

export interface Plan {
	id: string;
	uid: string;
	ref: DocumentReference;
	startTime: number;
	endTime: number;
	duration: number;
	activities: Activity[];
	tags: DocumentReference[] | Tag[];
	notes?: string;
	readonly: boolean;
	col: string;
	shareToken?: string;
	shareEnabled?: boolean;
	/** Links recurring plans together in a series */
	seriesId?: string;
}
