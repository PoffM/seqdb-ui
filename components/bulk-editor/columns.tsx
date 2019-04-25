import { Field } from "formik";
import { Column } from "react-table";
import titleCase from "title-case";

export function stringColumn(accessor: string): Column {
  return {
    Cell: ({ index }) => (
      <Field className="form-control" name={`${index}.${accessor}`} />
    ),
    Header: titleCase(accessor),
    accessor,
    minWidth: 200
  };
}
