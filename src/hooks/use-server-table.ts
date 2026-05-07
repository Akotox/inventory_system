"use client";

import { useState, useCallback } from "react";

export interface ServerTableState {
  pageIndex: number;
  pageSize: number;
  sortBy: string;
  sortDir: "asc" | "desc";
  search: string;
}

export interface UseServerTableReturn {
  state: ServerTableState;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (sortBy: string, sortDir: "asc" | "desc") => void;
  setSearch: (search: string) => void;
  reset: () => void;
  queryParams: Record<string, string>;
}

const DEFAULT_STATE: ServerTableState = {
  pageIndex: 0,
  pageSize: 25,
  sortBy: "createdAt",
  sortDir: "desc",
  search: "",
};

export function useServerTable(
  initial: Partial<ServerTableState> = {}
): UseServerTableReturn {
  const [state, setState] = useState<ServerTableState>({
    ...DEFAULT_STATE,
    ...initial,
  });

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, pageIndex: page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setState((prev) => ({ ...prev, pageSize: size, pageIndex: 0 }));
  }, []);

  const setSort = useCallback((sortBy: string, sortDir: "asc" | "desc") => {
    setState((prev) => ({ ...prev, sortBy, sortDir, pageIndex: 0 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setState((prev) => ({ ...prev, search, pageIndex: 0 }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...DEFAULT_STATE, ...initial });
  }, [initial]);

  const queryParams: Record<string, string> = {
    page: String(state.pageIndex),
    pageSize: String(state.pageSize),
    sortBy: state.sortBy,
    sortDir: state.sortDir,
    ...(state.search && { search: state.search }),
  };

  return { state, setPage, setPageSize, setSort, setSearch, reset, queryParams };
}
