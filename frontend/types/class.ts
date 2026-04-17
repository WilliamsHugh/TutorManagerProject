export interface ClassListing {
  id: number;
  code: string;
  title: string;
  mode: "Online" | "Offline";
  levelTag: string;
  salary: string;
  salaryNote: string;
  schedule?: string;
  location?: string;
  requirement?: string;
  postedAt: string;
}
