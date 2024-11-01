export type UserQueryGetModel = {
  pageSize: string;
  pageNumber: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  searchLoginTerm: string;
  searchEmailTerm: string;
};
