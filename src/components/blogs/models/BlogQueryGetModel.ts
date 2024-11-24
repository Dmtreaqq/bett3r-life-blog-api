export type BlogQueryGetModel = {
  searchNameTerm: string;
  pageSize: string;
  pageNumber: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
};

// export class BlogQueryGetModel {
//   constructor(
//     public searchNameTerm: string,
//     public pageSize: string,
//     public pageNumber: string,
//     public sortBy: string,
//     public sortDirection: "asc" | "desc",
//   ) {}
// }
