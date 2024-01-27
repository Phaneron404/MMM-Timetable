export type Config = {
  srcCSV?: string;
  timeTable?: Row[];
  header?: string;
  borderWidth?: number;
  borderColor?: string;
  emptyCellColor?: string;
  cellColor?: string;
  titleCellColor?: string;
  titleRow?: number[];
  titleColumn?: number[];
  pagination?: Pagination;
};

export type Row = {
  cells: Cell[];
};

export type Cell = {
  texts: string[];
  id?: number;
};

export type Pagination = {
  mode: string;
  keepFirst: boolean;
  duration: number;
  maxValues: number;
};
