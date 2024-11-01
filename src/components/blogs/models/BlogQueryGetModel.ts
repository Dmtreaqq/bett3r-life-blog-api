export type BlogQueryGetModel = {
  searchNameTerm: string;
  pageSize: string;
  pageNumber: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
};
