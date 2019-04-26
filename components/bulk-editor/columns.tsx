import { FastField } from "formik";
import { Column } from "react-table";
import titleCase from "title-case";

export function stringColumn(accessor: string): Column {
  return {
    Cell: ({ index }) => (
      <FastField className="form-control" name={`${index}.${accessor}`} />
    ),
    Header: titleCase(accessor),
    accessor,
    minWidth: 200
  };
}
