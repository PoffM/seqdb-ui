import { Field } from "formik";
import titleCase from "title-case";

export function stringColumn(accessor: string) {
  return {
    Cell: ({ index }) => (
      <Field className="form-control" name={`${index}.${accessor}`} />
    ),
    Header: titleCase(accessor),
    accessor
  };
}
